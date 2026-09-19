import assert from "node:assert/strict";
import test from "node:test";
import { clientOrigin } from "../src/app.js";
import {
  currentUser,
  authenticationMail,
  mailLanguage,
  mailFromOrigin,
  requestLogin,
  sessionCookie,
  userIdForEmail,
  verifyLogin,
} from "../src/auth.js";

test("login normalizes email before calculating the user id", () => {
  assert.equal(
    userIdForEmail("  USER@Example.COM "),
    userIdForEmail("user@example.com")
  );
});

test("login links target the configured frontend", () => {
  process.env.CLIENT_URL = "https://airboardgame.example/";
  assert.equal(
    clientOrigin({ get: () => "http://backend:4050" }),
    "https://airboardgame.example"
  );
  delete process.env.CLIENT_URL;
  assert.equal(
    clientOrigin({
      get: (header) =>
        header === "origin" ? "http://localhost:3001" : undefined,
    }),
    "http://localhost:3001"
  );
});

test("login mail sender uses the origin hostname", () => {
  assert.equal(
    mailFromOrigin("https://airboardgame.example:3001/login"),
    "noreply@airboardgame.example"
  );
});

test("login mail follows the browser language", () => {
  assert.equal(mailLanguage("fr-FR,fr;q=0.9,en;q=0.8"), "fr");
  assert.equal(mailLanguage("de-DE,de;q=0.9,en;q=0.8"), "en");
  assert.equal(mailLanguage("fr;q=0"), "en");

  const mail = authenticationMail("https://airboardgame.example/login/user/token", "fr-FR");
  assert.equal(mail.subject, "[Airboardgame] Votre lien d'authentification");
  assert.match(mail.text, /Bonjour/);
  assert.match(mail.html, /href="https:\/\/airboardgame\.example\/login\/user\/token"/);
});

test("fake email login token is one-time and creates a valid session cookie", async () => {
  const previousHost = process.env.EMAIL_HOST;
  const previousSecret = process.env.ABG_SECRET;
  const originalLog = console.log;
  let message;
  process.env.EMAIL_HOST = "fake";
  process.env.ABG_SECRET = "test-secret";
  console.log = (value) => {
    message = value;
  };
  try {
    await requestLogin("User@example.com", "http://localhost:3001");
  } finally {
    console.log = originalLog;
    if (previousHost === undefined) delete process.env.EMAIL_HOST;
    else process.env.EMAIL_HOST = previousHost;
    if (previousSecret === undefined) delete process.env.ABG_SECRET;
    else process.env.ABG_SECRET = previousSecret;
  }
  const [, userId, token] = message.match(/\/login\/([^/]+)\/([^/]+)$/);
  assert.equal(userId, userIdForEmail("user@example.com"));
  verifyLogin(userId, token);
  assert.throws(
    () => verifyLogin(userId, token),
    /Token invalid or has expired/
  );

  process.env.ABG_SECRET = "test-secret";
  const cookie = sessionCookie(userId).split(";")[0];
  assert.equal(currentUser({ headers: { cookie } }), userId);
  if (previousSecret === undefined) delete process.env.ABG_SECRET;
  else process.env.ABG_SECRET = previousSecret;
});
