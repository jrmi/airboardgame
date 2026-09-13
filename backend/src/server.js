import "dotenv/config.js";
import http from "node:http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { configureRealtime } from "./realtime/socket.js";
import { cleanupSessions } from "./services.js";

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

const runSessionCleanup = async () => {
  try {
    await cleanupSessions();
    console.log("Session cleanup completed");
  } catch (error) {
    console.error("Session cleanup failed", error);
  }
};

const cleanupInterval = setInterval(runSessionCleanup, 24 * 60 * 60 * 1000);
cleanupInterval.unref();
void runSessionCleanup();

const host = process.env.SERVER_HOST || "localhost";
const port = Number(process.env.SERVER_PORT || 4050);
server.listen(port, host, () =>
  console.log(`Airboardgame backend listening on http://${host}:${port}`)
);
