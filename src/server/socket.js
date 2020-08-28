import client2client from "client2client.io";
import { SOCKET_PATH } from "./settings.js";
import io from "socket.io";

const { handleC2C } = client2client;

export const defineSocket = (http) => {
  const ioServer = io(http, { path: SOCKET_PATH });

  ioServer.on("connection", (socket) => {
    handleC2C(socket);
  });
};
