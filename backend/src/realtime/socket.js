import { handleWire } from "wire.io";

export const configureRealtime = (io) => {
  io.on("connection", (socket) => {
    handleWire(socket);
  });
};
