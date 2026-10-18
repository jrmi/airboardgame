import { handleWire } from "wire.io";
import { configureModeration } from "./moderation.js";

export const configureRealtime = (io) => {
  io.on("connection", (socket) => {
    configureModeration(io, socket);
    handleWire(socket);
  });
};
