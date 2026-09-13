# Airboardgame current backend API

This document describes the backend contract currently consumed by Airboardgame. It is intended as a migration reference for replacing the Ricochet.js backend. It covers both the generic Ricochet.js HTTP API and the Airboardgame-specific setup in `backend/src/`.

The source of truth for the client HTTP calls is `src/utils/api.js`. The source of truth for the server-side policy and custom function is `backend/src/index.js`, `backend/src/hooks.js`, and `backend/src/getConfToken.js`. The Ricochet.js implementation examined for this document is the sibling `../ricochetjs` checkout.

## 1. Runtime topology

Airboardgame currently uses three cooperating services:

```text
Browser
  ├─ HTTP REST ───────────────► Ricochet.js (site-scoped API)
  │                              └─ encrypted ricochet.json setup
  ├─ Socket.IO/WebSocket ─────► wire.io relay
  └─ HTTP through custom function ► OpenVidu (server-to-server)
```

The Ricochet.js URL is configured by `VITE_API_ENDPOINT`; in production the default is the current browser origin. Every application URL is prefixed with the configured site id:

```text
{API_BASE}/{siteId}/...
```

With the default development proxy, `API_BASE` is empty and the browser calls paths such as `/airboardgame/store/game/...`; the Vite proxy forwards `/store`, `/file`, `/execute`, and `/auth` to the configured backend. When the proxy is disabled, the full API endpoint is used, for example `https://backend.example/airboardgame/store/game/...`.

The client sends `credentials: "include"` on all authenticated or store calls. Ricochet.js uses a signed, HTTP-only cookie named `session`, with a ten-day max age and `SameSite=Lax`.

## 2. Site and setup loading

Ricochet.js identifies a tenant from `/:siteId`. Before serving that tenant's API, it determines the origin hosting the setup bundle from the first available request header:

1. `X-Ricochet-Origin`
2. the origin of `Referer`
3. `Origin`
4. legacy `X-SPC-Host`

If none is present, the request returns HTTP 400 with:

```json
{"message":"One of X-Ricochet-Origin, Origin, Referer header is required"}
```

The server downloads `{ricochetOrigin}/ricochet.json`, decrypts it with the registered site's key, executes its default export once, and caches the resulting setup. The cache can be bypassed with `?clearCache=1`; the implementation also has a server-side cache switch. A replacement backend must either continue to expose this behavior during migration or remove the need for the encrypted remote setup while preserving the resulting routes and policies.

The Airboardgame bundle is generated from `backend/src/index.js` into `public/ricochet.json`. `backend/webpack.common.js` encrypts it with `RICOCHET_SITE_KEY` using Ricochet.js's AES-256-CBC format. The site key is server-side deployment material and must not be exposed to the browser.

### Ricochet.js site-management endpoints

These endpoints belong to the Ricochet.js host rather than to the Airboardgame application. They are used during installation/configuration, not by the browser application:

| Request | Purpose | Response/notes |
|---|---|---|
| `GET /site/settings` | Reports whether registration is enabled. | `{ "registrationEnabled": true|false }`. |
| `POST /_register/` | Starts site registration. | Requires JSON `siteId`, `name`, `emailFrom`, and `owner`. Returns the generated site record without its confirmation token, and sends an email. The response includes the one-time `key` needed to encrypt the setup bundle. |
| `GET /_register/{siteId}/confirm/{token}` | Confirms a new site or pending site update. | Returns `{ "message":"Site created" }` or `{ "message":"Site updated" }`. The token is single-use. |
| `PATCH /_register/{siteId}` | Starts a site metadata update. | Requires `name` and `emailFrom`; sends a confirmation email and returns the pending data without key/token. |
| `GET /{siteId}/ping` | Checks the site setup route. | Plain text `ok`; it still depends on origin resolution/setup loading. |

`siteId` must be at least three characters, start with an alphanumeric character, and contain only alphanumerics and `_`. Registration and site updates are email-confirmed. Existing clients do not depend on these management routes after deployment, but they are part of the current operational API.

## 3. Airboardgame data model and access policy

On setup, Airboardgame creates these Ricochet boxes:

| Box | Security | Purpose | Effective client access |
|---|---|---|---|
| `game` | `readOnly` | Game definitions | Public reads are filtered to published games; owners/admins can also see their private games. Writes are restricted to an authenticated owner or admin. |
| `room` | `public` | Room document | Generic Ricochet public read/write, although the current room UI primarily synchronizes through wire.io. |
| `session` | `public` | Saved board/session state | Generic Ricochet public read/write. |
| `user` | `private` | Account document | Only the authenticated user may read their own document; all other methods are rejected. |
| `files` | `private` | Declared but not used as the media box by the client | File access is governed by the box/resource policy. |

Ricochet wraps each logical box internally as `_{siteId}__{boxId}`. This is an implementation detail but explains why data must be migrated with the site boundary intact.

### Game hooks

The `before` hook applies to `game` writes (`POST`, `UPDATE`, or `DELETE`):

- unauthenticated writes return HTTP 403;
- the authenticated user id is forcibly written as `owner` for creation;
- for an existing game, only the current owner or a user whose `user` document has `isAdmin: true` may modify/delete it;
- updates preserve the existing owner, even if the request body attempts to change it;
- the hook sets `allow: true`, bypassing the box's generic write-security check.

The `after` hook filters a game list (only `GET` without a resource id): a game is returned if `board.published` is truthy, its `owner` equals the authenticated user id, or the user is an admin. A direct `GET /store/game/{id}` is not filtered by this hook; it is still subject to the box's read security and therefore is readable because `game` is `readOnly`.

### User hook

For `user`:

- only `GET` is allowed;
- the requested resource id must equal the authenticated user id, otherwise HTTP 403;
- if the user document does not exist, it is created as `{}` as part of the first authorized read;
- the hook sets `allow: true`, so the private box can be read for that user.

The client stores the user id locally as the SHA-256 hash of the lower-cased login email. It does not store the email itself as the user id.

### Session cleanup

A daily scheduled callback lists up to 10,000 session documents and deletes sessions older than 60 days, as well as sessions without a timestamp. The client writes `timestamp: Date.now()` in each saved session. The current implementation uses asynchronous `forEach`; a migration should preserve the intended retention policy and should preferably make deletion completion observable/reliable.

## 4. Generic JSON store API

The default store prefix is `store`. All paths below are relative to `/{siteId}`.

### List resources

```http
GET /{siteId}/store/{boxId}/?limit=50&sort=_createdOn&skip=0&fields=a,b&q=...
```

Response: HTTP 200 with a JSON array of resource objects.

Query parameters:

| Parameter | Meaning |
|---|---|
| `limit` | Maximum number of results; default 50. Airboardgame requests 2,000 games. |
| `skip` | Offset; default 0. |
| `sort` | Field name; prefix with `-` for descending. Default `_createdOn`. |
| `fields` | Comma-separated projection. Airboardgame requests `_id,board,owner`. |
| `q` | PivotQL expression, parsed by Ricochet.js. Invalid expressions return HTTP 400. |

The generic box security is checked unless a before hook returns `allow: true`. A private box therefore returns HTTP 403 to unauthenticated/general reads. For Airboardgame, the important concrete call is:

```http
GET /airboardgame/store/game/?fields=_id,board,owner&limit=2000
```

### Get one resource

```http
GET /{siteId}/store/{boxId}/{id}
```

Response: HTTP 200 with the stored JSON object. Missing boxes/resources return HTTP 404. A box id beginning with `_` returns HTTP 400.

Airboardgame uses this for `game`, `session`, `room`, and `user` through `getGame`, `getSession`, `getRoom`, and `getAccount`.

### Create or replace a resource

```http
POST /{siteId}/store/{boxId}/{id?}
Content-Type: application/json

{ ...document }
```

If `id` is omitted, Ricochet.js generates one. If supplied, the document is created or fully replaced. The response is the stored document, including `_id` and creation/update metadata. The Airboardgame client always supplies an id and uses this operation for `updateGame`, `updateSession`, and `updateRoom`.

### Update an existing resource

```http
PUT /{siteId}/store/{boxId}/{id}
Content-Type: application/json

{ ...partial fields }
```

The response is the merged stored document. It fails with HTTP 404 when the resource does not exist. The browser client does not currently call `PUT`; the server-side hook nevertheless recognizes the method name `UPDATE` rather than the actual HTTP method `PUT`, which is a compatibility detail to review during replacement.

### Delete a resource

```http
DELETE /{siteId}/store/{boxId}/{id}
```

Success:

```json
{"message":"Deleted"}
```

If no resource was deleted, the response is HTTP 404 with `{"message":"Box or resource not found"}`. Deleting a resource also clears all files associated with that box/resource in the Ricochet file backend.

### Stored document metadata

Ricochet-generated documents use `_id`, `_createdOn`, and `_updatedOn` (the memory backend actually writes `_updatedOn`; callers must not rely on a particular timestamp field unless migration compatibility requires it). Incoming `_createdOn` and `_modifiedOn` values are removed/ignored by the store backends. Airboardgame documents are otherwise schemaless JSON.

## 5. Airboardgame REST calls

### Games

| Client operation | Request | Result/use |
|---|---|---|
| `getGames()` | `GET /store/game/?fields=_id,board,owner&limit=2000` | Builds list entries `{id, owner, board, url}`. Adds local demo/test games separately. |
| `getGame(id)` | `GET /store/game/{id}` | Loads a real game. Adds client-only ids to `items` and `availableItems`. `demo`, `test`, `perf`, and `unpublished` are local fixtures and do not call the backend. |
| `createGame(data)` | `POST /store/game/{generatedId}` | Creates a game with a client-generated id. The server hook sets `owner`. |
| `getOrCreateGame(id,data)` | `GET`, then `POST` on 404 | Used by studio initialization. |
| `updateGame(id,data)` | `POST /store/game/{id}` | Full document replacement semantics at the HTTP layer. |
| `deleteGame(id)` | `DELETE /store/game/{id}` | Deletes the game and related files. |

The expected game document is a board-game JSON document containing at least `items`, `availableItems`, and `board`; the exact item schema is owned by the frontend game components and is not validated by Ricochet.js.

### Sessions

| Client operation | Request | Result/use |
|---|---|---|
| `getSession(id)` | `GET /store/session/{id}` | A missing session is treated by the client as a new session. |
| `updateSession(id,data)` | `POST /store/session/{id}` | Saves current state. |

The session document currently contains:

```json
{
  "items": [],
  "board": {},
  "availableItems": [],
  "messages": [],
  "timestamp": 1700000000000,
  "gameId": "game-id"
}
```

`messages` is truncated to the last 50 entries before saving. A session is auto-saved by the master board after changes, with a three-second grace delay in normal operation (shorter in CI). The session URL id is generated client-side and is also the board sync session id.

### Rooms

| Client operation | Request | Result/use |
|---|---|---|
| `getRoom(id)` | `GET /store/room/{id}` | Exported API helper; no active call site was found in the current client. |
| `updateRoom(id,data)` | `POST /store/room/{id}` | Exported API helper; no active call site was found in the current client. |

The visible room implementation initializes a room locally with a `sessions` array and synchronizes it through wire.io. The REST room box remains part of the configured backend contract and should not be removed without checking older clients.

## 6. File API and media library

The active media API is attached below a stored resource and requires that the resource already exists.

### Upload

```http
POST /{siteId}/store/{boxId}/{resourceId}/file/
Content-Type: multipart/form-data

file=<binary upload>
```

The multipart field name must be `file`. The server returns HTTP 200 with plain text containing the API-relative file path, for example:

```text
airboardgame/store/game/game-id/file/random-name.png
```

The exact prefix is `{siteId}/{storePrefix}/{boxId}/{resourceId}/file/{filename}`. The client stores this returned string as `{type: "local", content: filePath}` and later resolves it as `${API_BASE}/${filePath}`.

Ricochet's disk backend generates a random id filename and retains the MIME-derived extension. S3-backed deployments may redirect downloads to a CDN, a signed URL, or proxy the bytes.

### List files

```http
GET /{siteId}/store/{boxId}/{resourceId}/file/
```

Response: HTTP 200 with a JSON array of API-relative file paths. The client uses these paths to populate the media library and displays each image from `${API_BASE}/{path}`.

### Download

```http
GET /{siteId}/store/{boxId}/{resourceId}/file/{filename}
```

The server streams the file or responds with an HTTP redirect, depending on the configured file backend. It may emit `Content-Type`, `Content-Length`, `Last-Modified`, and `ETag`; conditional request headers are passed to S3 backends. Missing files return HTTP 404.

### Delete

The client receives a complete path from upload/list and calls:

```http
DELETE /{filePath}
```

For example, deleting `airboardgame/store/game/game-id/file/foo.png` is sent to `${API_BASE}/airboardgame/store/game/game-id/file/foo.png`. Success is JSON `{"message":"Deleted"}`; a missing file is HTTP 404.

The current client also exports `uploadImage(namespace,file)` and targets `/{siteId}/file/{namespace}/`, but no active call site uses it and the current Ricochet.js source does not mount that legacy route in the main store middleware. Treat it as legacy/unused rather than as a required replacement endpoint unless supporting older clients is a goal.

File authorization follows the parent resource: Ricochet first verifies that `{boxId}/{resourceId}` exists, runs `hooks.beforeFile`, and applies read/write box security. Airboardgame's `beforeFile` hook is the game ownership/admin hook, so game media can be modified only by the game's owner or an admin.

## 7. Passwordless authentication

Authentication is email-link based. The browser must include cookies on every request.

### Request a login link

```http
POST /{siteId}/auth/
Content-Type: application/json

{"userEmail":"person@example.com"}
```

Success is HTTP 200:

```json
{"message":"Token sent"}
```

The server lowercases the email and computes `userId = sha256(lowercasedEmail)`. It creates a short-lived one-time token through `easy-no-password`, then sends a link of the form:

```text
{remoteOrigin}/login/{userId}/{token}
```

In fake-email development mode the link is logged instead of delivered through a real SMTP service.

### Verify the link

```http
GET /{siteId}/auth/verify/{userId}/{token}
```

Success is HTTP 200 `{"message":"success"}` and sets `session.userId` to `{userId}`. Invalid or expired tokens return HTTP 403 with `{"message":"Token invalid or has expired"}`.

### Check authentication

```http
GET /{siteId}/auth/check
```

Success is HTTP 200 `{"message":"success"}`. Without a session it returns HTTP 403 `{"message":"Not authenticated"}`. The client maps every non-200 result to `false`.

### Logout

```http
GET /{siteId}/auth/logout/
```

Success is HTTP 200 `{"message":"logged out"}` and clears the session. The client then clears its local `isAuthenticated` and `userId` values.

The browser stores the hashed user id in local storage, but the cookie is the actual authority. The server derives `authenticatedUser` from the signed cookie for hooks and custom functions; callers must not be trusted merely because they provide a user id in JSON.

## 8. Account endpoint

```http
GET /{siteId}/store/user/{userId}
```

This is consumed by `getAccount(userId)` after login. The id must be the authenticated hashed email id. The first successful access creates an empty account document. The response is the user document, for example `{}` or `{ "isAdmin": true }`. The client uses `isAdmin` to enable admin behavior indirectly through server-side filtering/policy; it does not send an admin flag.

## 9. Custom execution API: OpenVidu token

Ricochet's execution router accepts all HTTP methods at:

```http
/{siteId}/execute/{functionName}/{id?}
```

Airboardgame registers exactly one custom function: `getConfToken`.

```http
GET /{siteId}/execute/getConfToken?session={openviduSessionId}
```

The function reads the `session` query parameter, creates an OpenVidu session with that custom id (a 409 means it already exists), then creates a connection token. It calls OpenVidu server-to-server using:

```text
POST {OPENVIDU_URL}/openvidu/api/sessions
POST {OPENVIDU_URL}/openvidu/api/sessions/{sessionId}/connection
Authorization: Basic base64("OPENVIDUAPP:{OPENVIDU_SECRET}")
```

The Ricochet execution route JSON-serializes the function result. Since `getConfToken` returns the token string, the HTTP body is a JSON string, not an object containing `token`.

The client maps HTTP 404 to “Webconference not enabled”, HTTP 403 to “Forbidden”, and other failures to a generic server error. The replacement backend must keep the OpenVidu secret server-side and must not proxy it to the browser.

## 10. Real-time synchronization (not Ricochet REST)

The client creates a Socket.IO connection using:

| Setting | Source/default |
|---|---|
| URL | `VITE_SOCKET_URL`, otherwise `window.location.origin` |
| path | `VITE_SOCKET_PATH`, otherwise `/socket.io` |
| transport | WebSocket only |
| connection | `forceNew: true` |

`@jrmi/use-socket.io` provides the socket to `react-sync-board`. `BoardWrapper` uses a room named `room_{sessionId}` and the session id as its board identity. This channel synchronizes board state, users, messages, and board actions between participants. `GameView` also mounts a socket-backed `BoardWrapper` for studio editing, using a generated session id.

Room UI synchronization uses wire.io abstractions over the Socket.IO connection:

- the master registers `getRoom`, returning the current room object;
- non-masters call `getRoom` once at connection and retry after two seconds on failure;
- non-masters subscribe to `roomUpdate`;
- the master publishes `roomUpdate` whenever the room changes.

The current application-level room payload is an object containing `sessions`; each session entry has at least an `id`. A replacement real-time service must preserve the room isolation, master/peer behavior, request/reply `getRoom`, and publish/subscribe `roomUpdate` semantics, or update the room UI and board library together.

## 11. Error contract and client handling

Ricochet's standard error response is JSON:

```json
{"message":"Human-readable error"}
```

Common statuses are:

| Status | Meaning in this application |
|---|---|
| 200 | Successful JSON response, token response, or file upload. |
| 400 | Missing origin header, malformed query, invalid input, or forbidden box naming. |
| 403 | Authentication required, private resource, ownership failure, or invalid login token. |
| 404 | Box/resource/file/function not found. The client often uses this to choose an initialization path. |
| 405 | Unsupported method, notably non-GET access to `user`. |
| 500 | Backend/setup/decryption or unexpected server error. |
| 503 | Setup/server not ready, or failure to send the authentication email. |

The client helpers do not parse the server's `message` field. They convert 404 and 403 into fixed JavaScript errors and collapse all other statuses >=300 into a generic “Server error”. A migration may improve errors, but changing status meanings can alter session initialization and authentication behavior.

## 12. Configuration and deployment dependencies

Frontend variables relevant to the contract:

- `VITE_RICOCHET_SITEID`: tenant/site id, normally `airboardgame`;
- `VITE_API_ENDPOINT`: Ricochet HTTP origin;
- `VITE_USE_PROXY`: enables the development proxy unless set to `0`;
- `VITE_SOCKET_URL`, `VITE_SOCKET_PATH`: real-time endpoint;
- `VITE_WEBCONFERENCE`: `audio`, `video`, or disabled.

Backend variables relevant to the contract:

- `RICOCHET_SECRET`: signs the session cookie and is also used by Ricochet.js;
- `RICOCHET_SITE_KEY`: decrypts the generated Airboardgame setup bundle;
- `JSON_STORE_BACKEND`/`STORE_BACKEND`: memory, NeDB, or MongoDB;
- `FILE_STORE_BACKEND`/`FILE_STORAGE`: memory, disk, or S3-compatible storage;
- `NEDB_DIRNAME`, `MONGODB_URI`, `MONGODB_DATABASE`: persistence settings;
- `DISK_DESTINATION` or S3 settings: file persistence/delivery;
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`: passwordless auth mail;
- `OPENVIDU_URL`, `OPENVIDU_SECRET`: web-conference token generation.

For local development, `backend/npm run all` starts Ricochet.js, wire.io, and the webpack watcher. The frontend separately runs Vite. The generated `public/ricochet.json` must be hosted at the browser-facing frontend origin expected by the Ricochet origin resolution.

## 13. Migration checklist

The minimum compatibility surface is:

- site-prefixed REST routes for game, session, room, user, file, auth, and execute;
- cookie-based authentication with the same hashed-email user ids, login-link flow, and credentialed CORS;
- game visibility filtering and owner/admin write protection;
- user self-access and lazy account creation;
- POST full-save semantics and the existing `_id`/timestamp response shape;
- file upload/list/download/delete paths and returned path format, including parent-resource authorization;
- OpenVidu token endpoint returning a JSON string;
- Socket.IO/wire.io board and room synchronization;
- session retention cleanup after 60 days;
- support for existing persisted game/session/user documents and existing media URLs.

Before cutover, run Cypress authentication, studio, session, room, message, selection, board, and item scenarios against the replacement backend. Pay particular attention to: unauthenticated public game-list filtering, owner reassignment attempts, first-time user account creation, loading a nonexistent session, media deletion, and two-browser real-time synchronization.
