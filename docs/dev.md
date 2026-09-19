# Development

Airboardgame has a Vite client and a Node/Feathers backend. Node.js and npm are
required for both parts. The backend serves the HTTP API and Socket.IO from the
same process, by default on port `4050`.

## Backend

```sh
cd backend
npm ci
cp .env.dist .env
```

Set `MONGODB_URI`, `MONGODB_DATABASE`, and a long random `ABG_SECRET` in
`.env` when using MongoDB. For the simplest local setup, use NeDB instead:

```dotenv
STORE_BACKEND=nedb
NEDB_BACKEND_DIRNAME=/absolute/path/to/airboardgame-data
```

The directory is created/used by the backend for its JSON collections. Keep it
outside the repository if it contains local data. The backend uses the existing
documents and serves its HTTP API and Socket.IO endpoint from one process:

```sh
npm run dev
```

From the repository root, the equivalent shortcut is `npm run backend:dev`.

For local passwordless authentication, keep `EMAIL_HOST=fake`. No SMTP account
is then required: each login link is printed in the backend terminal. Open it in
the browser to complete authentication. Configure `EMAIL_HOST`, `EMAIL_PORT`,
`EMAIL_USER`, and `EMAIL_PASSWORD` only when testing real email delivery.
Set `DISK_DESTINATION` if game media should be stored outside `backend/media`.
OpenVidu is enabled by setting `OPENVIDU_URL` and `OPENVIDU_SECRET`.

### Local file storage

Game media can be stored directly on the backend's local filesystem instead of
using S3. Set the following variables in `.env`:

```dotenv
FILE_STORAGE=disk
DISK_DESTINATION=/absolute/path/to/airboardgame-data/media
```

`FILE_STORAGE=disk` is also the default when `FILE_STORAGE` and
`FILE_STORE_BACKEND` are not set. The backend creates one directory per game
under `DISK_DESTINATION`. Use an absolute path so the location does not depend
on the directory from which the backend is started. Keep this directory on a
persistent volume or back it up; files are not stored in MongoDB or NeDB.

For a setup that does not use either S3 or MongoDB, store the game data locally
with NeDB as well:

```dotenv
STORE_BACKEND=nedb
NEDB_BACKEND_DIRNAME=/absolute/path/to/airboardgame-data/db
FILE_STORAGE=disk
DISK_DESTINATION=/absolute/path/to/airboardgame-data/media
```

With Docker, the image provides `/data/db` and `/data/media`. Run the backend
with a persistent volume and set the corresponding paths:

```sh
docker run -d --name airboardgame-backend \
  --restart unless-stopped \
  -p 4050:4050 \
  -v airboardgame-data:/data \
  --env-file .env \
  airboardgame-backend
```

```dotenv
STORE_BACKEND=nedb
NEDB_BACKEND_DIRNAME=/data/db
FILE_STORAGE=disk
DISK_DESTINATION=/data/media
```

If MongoDB is used for the game data, only the media directory needs to be
persisted locally. S3 variables are not required when `FILE_STORAGE=disk`.

### Docker deployment

The backend can be built and run as a standalone container:

```sh
cd backend
docker build -t airboardgame-backend .
docker run -d --name airboardgame-backend \
  --restart unless-stopped \
  -p 4050:4050 \
  -v airboardgame-data:/data \
  --env-file .env \
  airboardgame-backend
```

For the default NeDB + disk-media setup, set `STORE_BACKEND=nedb` and keep
`NEDB_BACKEND_DIRNAME=/data/db` and `DISK_DESTINATION=/data/media`. For a
MongoDB or S3 deployment, configure those services in `.env` and keep the
`/data` volume only if local media or NeDB data is still used.

## Client

From the repository root, in a second terminal:

```sh
npm ci
cp .env.dist .env
npm start
```

The default client configuration expects the backend HTTP and Socket.IO endpoints
at `http://localhost:4050` and uses the `airboardgame` site prefix. With
`VITE_USE_PROXY=1`, Vite proxies both endpoints through port `3001`. Set
`VITE_API_ENDPOINT` and `VITE_SOCKET_URL` to the backend origin when the backend
is hosted elsewhere.

To verify both backend endpoints, run `npm run check` after starting the backend.

## Tests

Run the backend tests with `npm run backend:test`, and the frontend lint/build
checks with `npm run lint` and `npm run build`. The Cypress suite requires a
running database, backend, and client; run it with `npm run cypress:run`.
