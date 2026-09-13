import assert from "node:assert/strict";
import test from "node:test";
import { clientOrigin } from "../src/app.js";
import { currentUser, requestLogin, sessionCookie, userIdForEmail, verifyLogin } from "../src/auth.js";

test("login normalizes email before calculating the user id", () => {
  assert.equal(userIdForEmail("  USER@Example.COM "), userIdForEmail("user@example.com"));
});

test("login links target the configured frontend", () => {
  process.env.CLIENT_URL = "https://airboardgame.example/";
  assert.equal(clientOrigin({ get: () => "http://backend:4050" }), "https://airboardgame.example");
  delete process.env.CLIENT_URL;
  assert.equal(clientOrigin({ get: (header) => header === "origin" ? "http://localhost:3001" : undefined }), "http://localhost:3001");
});

test("fake email login token is one-time and creates a valid session cookie", async () => {
  const previousHost = process.env.EMAIL_HOST;
  const previousSecret = process.env.RICOCHET_SECRET;
  const originalLog = console.log;
  let message;
  process.env.EMAIL_HOST = "fake";
  process.env.RICOCHET_SECRET = "test-secret";
  console.log = (value) => { message = value; };
  try {
    await requestLogin("User@example.com", "http://localhost:3001");
  } finally {
    console.log = originalLog;
    if (previousHost === undefined) delete process.env.EMAIL_HOST;
    else process.env.EMAIL_HOST = previousHost;
    if (previousSecret === undefined) delete process.env.RICOCHET_SECRET;
    else process.env.RICOCHET_SECRET = previousSecret;
  }
  const [, userId, token] = message.match(/\/login\/([^/]+)\/([^/]+)$/);
  assert.equal(userId, userIdForEmail("user@example.com"));
  verifyLogin(userId, token);
  assert.throws(() => verifyLogin(userId, token), /Token invalid or has expired/);

  process.env.RICOCHET_SECRET = "test-secret";
  const cookie = sessionCookie(userId).split(";")[0];
  assert.equal(currentUser({ headers: { cookie } }), userId);
  if (previousSecret === undefined) delete process.env.RICOCHET_SECRET;
  else process.env.RICOCHET_SECRET = previousSecret;
});
