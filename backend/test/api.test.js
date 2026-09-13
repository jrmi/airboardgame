import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Readable, Writable } from "node:stream";
import test, { after, before, beforeEach, describe } from "node:test";
import { createApp } from "../src/app.js";
import { getConfToken } from "../src/conference.js";
import { getCollection } from "../src/db/mongodb.js";
import { cleanupSessions, gameService, mediaService, mediaPath, safeFilename } from "../src/services.js";

const site = "airboardgame";
const user = crypto.createHash("sha256").update("owner@example.com").digest("hex");
const otherUser = crypto.createHash("sha256").update("other@example.com").digest("hex");
const cookie = (id) => {
  const signature = crypto.createHmac("sha256", "api-test-secret").update(id).digest("base64url");
  return `session=${id}.${signature}`;
};

let app;
let dataDir;

const call = async (route, options = {}) => {
  const headers = new Headers(options.headers);
  if (options.user) headers.set("cookie", cookie(options.user));
  let requestBody = options.body;
  if (requestBody instanceof FormData) {
    const prepared = new Request("http://test", { method: options.method || "POST", body: requestBody });
    requestBody = Buffer.from(await prepared.arrayBuffer());
    headers.set("content-type", prepared.headers.get("content-type"));
  }
  if (requestBody && (typeof requestBody === "string" || Buffer.isBuffer(requestBody))) headers.set("content-length", String(Buffer.byteLength(requestBody)));
  const request = Readable.from(requestBody ? [requestBody] : [])
  request.method = options.method || "GET";
  request.url = route;
  request.originalUrl = route;
  request.headers = Object.fromEntries(headers.entries());
  request.httpVersion = "1.1";
  request.socket = { encrypted: false };
  const chunks = [];
  let statusCode = 200;
  const response = new Writable({ write(chunk, encoding, callback) { chunks.push(Buffer.from(chunk, encoding)); callback(); } });
  response.statusCode = 200;
  response.headers = new Map();
  response.setHeader = (name, value) => response.headers.set(name.toLowerCase(), value);
  response.getHeader = (name) => response.headers.get(name.toLowerCase());
  response.removeHeader = (name) => response.headers.delete(name.toLowerCase());
  response.writeHead = (status) => { response.statusCode = status; };
  response.assignSocket = () => {};
  response.detachSocket = () => {};
  response.write = (chunk, encoding) => { chunks.push(Buffer.from(chunk, encoding)); return true; };
  response.end = (chunk, encoding) => {
    if (chunk) response.write(chunk, encoding);
    response.emit("finish");
    return response;
  };
  const done = new Promise((resolve, reject) => { response.on("finish", resolve); response.on("error", reject); });
  app.handle(request, response);
  await done;
  const text = Buffer.concat(chunks).toString();
  let parsedBody;
  try { parsedBody = JSON.parse(text); } catch { parsedBody = text; }
  return { response: { status: response.statusCode, headers: { get: (name) => response.getHeader(name) } }, body: parsedBody };
};

const json = (method, body, userId) => ({ method, user: userId, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

before(async () => {
  dataDir = await fs.mkdtemp(path.join(os.tmpdir(), "airboardgame-api-"));
  process.env.STORE_BACKEND = "nedb";
  process.env.NEDB_BACKEND_DIRNAME = dataDir;
  process.env.DISK_DESTINATION = path.join(dataDir, "media");
  process.env.RICOCHET_SECRET = "api-test-secret";
  process.env.EMAIL_HOST = "fake";
  app = createApp();
  app.use(`/${site}`, createApp());
});

beforeEach(async () => {
  await fs.rm(process.env.DISK_DESTINATION, { recursive: true, force: true });
  for (const box of ["game", "session", "room", "user"]) {
    await (await getCollection(box)).deleteMany({});
  }
});

after(async () => {
  await fs.rm(dataDir, { recursive: true, force: true });
});

describe("HTTP API", () => {
  test("auth check, logout, and site-prefixed routes", async () => {
    assert.equal((await call("/auth/check")).response.status, 403);
    assert.equal((await call("/auth/logout/")).body.message, "logged out");
    const checked = await call(`/${site}/auth/check`, { user });
    assert.equal(checked.response.status, 200);
    assert.equal(checked.body.message, "success");
  });

  test("login request and verification consume the token", async () => {
    const originalLog = console.log;
    let link;
    console.log = (message) => { link = message; };
    try { assert.equal((await call("/auth/", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userEmail: "Owner@Example.com" }) })).response.status, 200); }
    finally { console.log = originalLog; }
    const [, userId, token] = link.match(/\/login\/([^/]+)\/([^/]+)$/);
    const verified = await call(`/auth/verify/${userId}/${token}`);
    assert.equal(verified.response.status, 200);
    assert.match(verified.response.headers.get("set-cookie"), new RegExp(`session=${userId}\\.`));
    assert.equal((await call(`/auth/verify/${userId}/${token}`)).response.status, 403);
  });

  test("game list filters unpublished games and supports query fields", async () => {
    await call("/store/game/private", json("POST", { board: {} }, user));
    await call("/store/game/public", json("POST", { board: { published: true }, title: "Public" }, otherUser));
    const anonymous = await call("/store/game?fields=_id,title");
    assert.deepEqual(anonymous.body, [{ _id: "public", title: "Public" }]);
    const owner = await call("/store/game?limit=10", { user });
    assert.deepEqual(owner.body.map(({ _id }) => _id).sort(), ["private", "public"]);
  });

  test("game CRUD enforces ownership and preserves the owner", async () => {
    const created = await call("/store/game/g1", json("POST", { board: { published: false }, owner: otherUser }, user));
    assert.equal(created.response.status, 200);
    assert.equal(created.body.owner, user);
    assert.equal((await call("/store/game/g1", json("POST", { title: "no", owner: otherUser }, otherUser))).response.status, 403);
    assert.equal((await call("/store/game/g1", { user })).body.title, undefined);
    assert.equal((await call("/store/game/g1", { method: "DELETE", user: otherUser })).response.status, 403);
    assert.deepEqual((await call("/store/game/g1", { method: "DELETE", user })).body, { message: "Deleted" });
    assert.equal((await call("/store/game/g1")).response.status, 404);
    assert.equal((await call("/store/game/g2", json("POST", {}))).response.status, 403);
  });

  test("session, room, and user APIs support CRUD and account protection", async () => {
    assert.equal((await call("/store/session/s1", json("POST", { timestamp: Date.now() }))).response.status, 200);
    assert.deepEqual((await call("/store/session/s1")).body._id, "s1");
    assert.equal((await call("/store/room/r1", json("POST", { members: [] }))).response.status, 200);
    assert.deepEqual((await call("/store/room/r1")).body.members, []);
    assert.equal((await call(`/store/user/${user}`, { user })).response.status, 200);
    assert.equal((await call(`/store/user/${user}`, { user })).body._id, user);
    assert.equal((await call(`/store/user/${otherUser}`, { user })).response.status, 403);
    assert.equal((await call(`/store/user/${user}`)).response.status, 403);
  });

  test("media upload, list, download, and deletion use game authorization", async () => {
    await call("/store/game/media", json("POST", { board: {} }, user));
    const form = new FormData();
    form.append("file", new Blob(["hello"], { type: "text/plain" }), "hello.txt");
    const uploaded = await call("/store/game/media/file/", { method: "POST", body: form, user });
    assert.equal(uploaded.response.status, 200);
    assert.match(uploaded.body, new RegExp(`^${site}/store/game/media/file/[a-f0-9]{32}\\.txt$`));
    const files = await call("/store/game/media/file/");
    assert.deepEqual(files.body, [uploaded.body]);
    const filename = path.basename(uploaded.body);
    const downloaded = await mediaService.get("media", filename);
    assert.equal(await fs.readFile(downloaded.path, "utf8"), "hello");
    assert.equal((await call(`/store/game/media/file/missing-${filename}`)).response.status, 404);
    assert.equal((await call(`/store/game/media/file/${filename}`, { method: "DELETE", user: otherUser })).response.status, 403);
    assert.deepEqual((await call(`/store/game/media/file/${filename}`, { method: "DELETE", user })).body, { message: "Deleted" });
    assert.equal((await call("/store/game/no-file/file/", { method: "POST", user })).response.status, 400);
  });

  test("conference endpoint reports disabled configuration", async () => {
    const result = await call("/execute/getConfToken?session=s1");
    assert.equal(result.response.status, 404);
    assert.equal(result.body.message, "Webconference not enabled");
  });
});

describe("services and recurring cleanup", () => {
  test("cleanupSessions removes stale and untimestamped sessions only", async () => {
    const sessions = await getCollection("session");
    await sessions.insertOne({ _id: "old", timestamp: Date.now() - 61 * 24 * 60 * 60 * 1000 });
    await sessions.insertOne({ _id: "missing" });
    await sessions.insertOne({ _id: "new", timestamp: Date.now() });
    await cleanupSessions();
    assert.equal(await sessions.findOne({ _id: "old" }), null);
    assert.equal(await sessions.findOne({ _id: "missing" }), null);
    assert.equal((await sessions.findOne({ _id: "new" }))._id, "new");
  });

  test("media path and filename helpers prevent path traversal", () => {
    assert.equal(safeFilename("../../secret.txt"), "secret.txt");
    assert.equal(mediaPath("g", "image.png"), `${site}/store/game/g/file/image.png`);
  });

  test("admin can modify another user's game", async () => {
    const users = await getCollection("user");
    await users.insertOne({ _id: user, isAdmin: true });
    await gameService.save("game", "admin-game", { title: "initial", owner: otherUser }, otherUser);
    const updated = await gameService.save("game", "admin-game", { title: "updated" }, user);
    assert.equal(updated.owner, otherUser);
    assert.equal(updated.title, "updated");
  });
});

describe("OpenVidu API", () => {
  test("creates a session and requests a connection token", async () => {
    const previous = { url: process.env.OPENVIDU_URL, secret: process.env.OPENVIDU_SECRET, fetch: globalThis.fetch };
    const calls = [];
    process.env.OPENVIDU_URL = "https://video.example";
    process.env.OPENVIDU_SECRET = "secret";
    globalThis.fetch = async (url, options) => {
      calls.push({ url, options });
      return calls.length === 1 ? new Response(JSON.stringify({ id: "actual" }), { status: 200 }) : new Response(JSON.stringify({ token: "token" }), { status: 200 });
    };
    try {
      assert.equal(await getConfToken("room/1"), "token");
      assert.equal(calls[0].options.headers.Authorization, `Basic ${Buffer.from("OPENVIDUAPP:secret").toString("base64")}`);
      assert.match(calls[1].url, /sessions\/actual\/connection$/);
    } finally {
      globalThis.fetch = previous.fetch;
      if (previous.url === undefined) delete process.env.OPENVIDU_URL; else process.env.OPENVIDU_URL = previous.url;
      if (previous.secret === undefined) delete process.env.OPENVIDU_SECRET; else process.env.OPENVIDU_SECRET = previous.secret;
    }
  });
});
