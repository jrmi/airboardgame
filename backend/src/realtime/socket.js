const rooms = new Map();
const registrations = new Map();
const calls = new Map();

export const configureRealtime = (io) => {
  io.on("connection", (socket) => {
    socket.on("joinSuperSocket", ({ room, userId } = {}) => {
      if (!room) return;
      socket.join(room);
      const members = rooms.get(room) || new Set();
      const wasEmpty = members.size === 0;
      members.add(socket.id);
      rooms.set(room, members);
      if (wasEmpty) socket.emit(`${room}.isMaster`);
      socket.emit(`${room}.roomJoined`, userId || socket.id);
    });
    socket.onAny((event, payload) => {
      const match = event.match(/^(.*)\.(publish|_call|leave)$/);
      const resultMatch = event.match(/^(.*)\._result\.(.+)$/);
      if (resultMatch) {
        const caller = calls.get(resultMatch[2]);
        if (caller) io.to(caller).emit(event, payload);
        calls.delete(resultMatch[2]);
        return;
      }
      if (!match) return;
      const [, room, action] = match;
      if (action === "leave") {
        socket.leave(room);
        rooms.get(room)?.delete(socket.id);
      } else if (action === "publish") {
        const { name, params, self } = payload || {};
        io.to(room).except(self ? "__never__" : socket.id).emit(`${room}.${name}`, params);
        if (self) socket.emit(`${room}.${name}`, params);
      } else if (action === "_call") {
        const roomRegistrations = registrations.get(room) || new Map();
        if (payload?.name === "register") {
          roomRegistrations.set(`${socket.id}:${payload.params?.name}`, socket.id);
          registrations.set(room, roomRegistrations);
          socket.emit(`${room}._result.${payload.callId}`, { ok: true });
        } else if (payload?.name === "unregister") {
          roomRegistrations.delete(`${socket.id}:${payload.params?.name}`);
          socket.emit(`${room}._result.${payload.callId}`, { ok: true });
        } else if (payload?.name === "call") {
          const target = [...roomRegistrations.entries()].find(([key]) => key.endsWith(`:${payload.params?.name}`) && !key.startsWith(`${socket.id}:`))?.[1];
          if (!target) socket.emit(`${room}._result.${payload.callId}`, { err: `Function ${payload.params?.name} is not registered` });
          else { calls.set(payload.callId, socket.id); io.to(target).emit(event, payload); }
        }
      }
    });
    socket.on("disconnect", () => {
      rooms.forEach((members, room) => { members.delete(socket.id); if (!members.size) rooms.delete(room); });
      registrations.forEach((members, room) => { for (const key of members.keys()) if (key.startsWith(`${socket.id}:`)) members.delete(key); if (!members.size) registrations.delete(room); });
    });
  });
};
