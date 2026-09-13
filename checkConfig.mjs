import dotenv from "dotenv";
import { io } from "socket.io-client";

dotenv.config();

const apiEndpoint = (process.env.VITE_API_ENDPOINT || "http://localhost:4050").replace(/\/$/, "");
const socketURL = (process.env.VITE_SOCKET_URL || apiEndpoint).replace(/\/$/, "");
const socketPath = process.env.VITE_SOCKET_PATH || "/socket.io";

const fail = (message) => {
  console.log(`🚨 ${message}`);
  process.exitCode = 1;
};

const check = async () => {
  try {
    const response = await fetch(`${apiEndpoint}/health`);
    if (!response.ok) {
      fail(`Le backend ne répond pas correctement. URL testée : ${apiEndpoint}/health`);
      return;
    }
    console.log(`✅ Backend HTTP disponible sur ${apiEndpoint}`);
  } catch {
    fail(`Le backend HTTP n'est pas démarré. URL testée : ${apiEndpoint}`);
    return;
  }

  await new Promise((resolve) => {
    const socket = io(socketURL, {
      transports: ["websocket"],
      path: socketPath,
      timeout: 5000,
    });
    const timer = setTimeout(() => {
      socket.disconnect();
      fail(`Socket.IO n'a pas répondu en 5 secondes. URL testée : ${socketURL}${socketPath}`);
      resolve();
    }, 5000);

    socket.on("connect", () => {
      clearTimeout(timer);
      socket.disconnect();
      console.log(`✅ Socket.IO disponible sur ${socketURL}${socketPath}`);
      resolve();
    });

    socket.on("connect_error", () => {
      clearTimeout(timer);
      socket.disconnect();
      fail(`Socket.IO n'est pas disponible. URL testée : ${socketURL}${socketPath}`);
      resolve();
    });
  });
};

check();
