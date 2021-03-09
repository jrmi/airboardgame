import { defineConfig } from "vite";
import analyze from "rollup-plugin-analyzer";
import reactRefresh from "@vitejs/plugin-react-refresh";
import dotenv from "dotenv";
dotenv.config();

const useProxy = process.env.VITE_USE_PROXY;
const server = process.env.VITE_API_ENDPOINT;
const socketServer = process.env.VITE_SOCKET_URL;

let proxy = {};

if (useProxy) {
  console.log("Proxy backend...");
  proxy = {
    server: {
      proxy: {
        "/socket.io": socketServer
          .replace("https", "wss")
          .replace("http", "ws"),
        "/store": server,
        "/execute": server,
        "/file": server,
        "/auth": server,
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(),
    analyze({ summaryOnly: true, hideDeps: true, limit: 20 }),
  ],
  ...proxy,
});
