# Development

Airboardgame has a Vite client and a Node/Feathers backend. Node.js and npm are
required for both parts.

## Backend

```sh
cd backend
npm ci
cp .env.dist .env
```

Set `MONGODB_URI`, `MONGODB_DATABASE`, and a long random `RICOCHET_SECRET` in
`.env`. The backend uses the existing MongoDB documents and serves its HTTP API
and Socket.IO endpoint from one process:

```sh
npm start
```

For local passwordless authentication, leave `EMAIL_HOST=fake`; login links are
printed in the backend console. Configure the SMTP variables for real email.
Set `DISK_DESTINATION` if game media should be stored outside `backend/media`.
OpenVidu is enabled by setting `OPENVIDU_URL` and `OPENVIDU_SECRET`.

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

From the repository root:

```sh
npm ci
cp .env.dist .env
npm start
```

The default client configuration expects the backend at `http://localhost:4050`
and uses the `airboardgame` site prefix. Set `VITE_API_ENDPOINT` and
`VITE_SOCKET_URL` when the backend is hosted elsewhere.

## Tests

Run the frontend lint/build checks with `npm run lint` and `npm run build`. The
Cypress suite requires a running MongoDB, backend, and client; run it with
`npm run cypress:run`.
