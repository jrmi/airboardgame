const RECONNECT_GRACE_MS = 30_000;

const sessions = new Map();

const emptyState = () => ({
  moderatorId: null,
  moderatorName: null,
  reconnectUntil: null,
  refereeView: false,
});

const stateOf = (session) => ({
  ...session.state,
  connectedUsers: [...session.users.values()].map(({ name }) => ({ name })),
});

const broadcast = (io, sessionId, session) => {
  io.to(`moderation:${sessionId}`).emit("moderation:state", stateOf(session));
};

const getSession = (sessionId) => {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      state: emptyState(),
      users: new Map(),
      sockets: new Map(),
      expiry: null,
    });
  }
  return sessions.get(sessionId);
};

const clearModerator = (session) => {
  clearTimeout(session.expiry);
  session.expiry = null;
  session.state = emptyState();
};

const reply = (ack, ok, error, state) => {
  if (typeof ack === "function") ack({ ok, error, state });
};

export const configureModeration = (io, socket) => {
  let membership;

  const leaveSession = () => {
    if (!membership) return;
    const { sessionId, userId } = membership;
    socket.leave(`moderation:${sessionId}`);
    const session = sessions.get(sessionId);
    membership = null;
    if (!session) return;
    const connections = session.sockets.get(userId);
    connections?.delete(socket.id);
    if (connections?.size) return;

    session.sockets.delete(userId);
    session.users.delete(userId);
    if (session.state.moderatorId === userId) {
      session.state.refereeView = false;
      session.state.reconnectUntil = Date.now() + RECONNECT_GRACE_MS;
      session.expiry = setTimeout(() => {
        if (session.state.moderatorId !== userId) return;
        clearModerator(session);
        broadcast(io, sessionId, session);
        if (!session.users.size) sessions.delete(sessionId);
      }, RECONNECT_GRACE_MS);
      session.expiry.unref?.();
    }
    broadcast(io, sessionId, session);
    if (!session.users.size && !session.state.moderatorId)
      sessions.delete(sessionId);
  };

  const sendState = (ack) => {
    if (!membership) return reply(ack, false, "not-joined");
    const session = sessions.get(membership.sessionId);
    reply(ack, true, null, stateOf(session));
  };

  socket.on("moderation:join", (payload = {}, ack) => {
    const { sessionId, userId, name } = payload || {};
    if (
      typeof sessionId !== "string" ||
      !sessionId ||
      typeof userId !== "string" ||
      !userId
    ) {
      return reply(ack, false, "invalid-identity");
    }

    leaveSession();
    const session = getSession(sessionId);

    membership = { sessionId, userId };
    socket.join(`moderation:${sessionId}`);
    let connections = session.sockets.get(userId);
    if (!connections) {
      connections = new Set();
      session.sockets.set(userId, connections);
    }
    connections.add(socket.id);
    session.users.set(userId, { name: String(name || "") });

    if (session.state.moderatorId === userId && session.expiry) {
      clearTimeout(session.expiry);
      session.expiry = null;
      session.state.reconnectUntil = null;
    }
    broadcast(io, sessionId, session);
    sendState(ack);
  });

  socket.on("moderation:request-state", sendState);
  socket.on("moderation:leave", leaveSession);

  socket.on("moderation:claim", (ack) => {
    if (!membership) return reply(ack, false, "not-joined");
    const session = sessions.get(membership.sessionId);
    if (
      session.state.moderatorId &&
      session.state.moderatorId !== membership.userId
    ) {
      return reply(ack, false, "role-taken", stateOf(session));
    }
    session.state = {
      moderatorId: membership.userId,
      moderatorName: session.users.get(membership.userId)?.name || "",
      reconnectUntil: null,
      refereeView: false,
    };
    broadcast(io, membership.sessionId, session);
    reply(ack, true, null, stateOf(session));
  });

  socket.on("moderation:release", (ack) => {
    if (!membership) return reply(ack, false, "not-joined");
    const session = sessions.get(membership.sessionId);
    if (session.state.moderatorId !== membership.userId) {
      return reply(ack, false, "not-moderator", stateOf(session));
    }
    clearModerator(session);
    broadcast(io, membership.sessionId, session);
    reply(ack, true, null, stateOf(session));
  });

  socket.on("moderation:transfer", ({ userId } = {}, ack) => {
    if (!membership) return reply(ack, false, "not-joined");
    const session = sessions.get(membership.sessionId);
    if (session.state.moderatorId !== membership.userId) {
      return reply(ack, false, "not-moderator", stateOf(session));
    }
    if (!session.sockets.has(userId)) {
      return reply(ack, false, "target-offline", stateOf(session));
    }
    session.state = {
      moderatorId: userId,
      moderatorName: session.users.get(userId)?.name || "",
      reconnectUntil: null,
      refereeView: false,
    };
    broadcast(io, membership.sessionId, session);
    reply(ack, true, null, stateOf(session));
  });

  socket.on("moderation:referee-view", ({ enabled } = {}, ack) => {
    if (!membership) return reply(ack, false, "not-joined");
    const session = sessions.get(membership.sessionId);
    if (session.state.moderatorId !== membership.userId) {
      return reply(ack, false, "not-moderator", stateOf(session));
    }
    session.state.refereeView = enabled === true;
    broadcast(io, membership.sessionId, session);
    reply(ack, true, null, stateOf(session));
  });

  socket.on("disconnect", leaveSession);
};

export const moderationInternals = { sessions, RECONNECT_GRACE_MS };
