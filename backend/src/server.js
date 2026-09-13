import "dotenv/config.js";
import http from "node:http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { configureRealtime } from "./realtime/socket.js";

const app = createApp();
// Keep the site prefix used by the current browser client. Unprefixed routes
// remain useful when the backend is mounted behind a reverse proxy.
app.use(`/${app.get("site")}`, createApp());
const server = http.createServer(app);
const io = new Server(server, {
  path: process.env.SOCKET_PATH || "/socket.io",
  cors: { origin: true, credentials: true },
});
configureRealtime(io);
const host = process.env.SERVER_HOST || "localhost";
const port = Number(process.env.SERVER_PORT || 4050);
server.listen(port, host, () =>
  console.log(`Airboardgame backend listening on http://${host}:${port}`)
);
