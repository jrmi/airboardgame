import test from "node:test";
import assert from "node:assert/strict";
import {
  configureModeration,
  moderationInternals,
} from "../src/realtime/moderation.js";

let nextSocketId = 0;

const makeIo = () => ({
  events: [],
  to(room) {
    return {
      emit: (event, payload) => this.events.push({ room, event, payload }),
    };
  },
});

const makeSocket = (io) => {
  const handlers = new Map();
  const socket = {
    id: `socket-${++nextSocketId}`,
    on(event, handler) {
      handlers.set(event, handler);
    },
    join() {},
    leave() {},
    send(event, ...args) {
      return handlers.get(event)?.(...args);
    },
  };
  configureModeration(io, socket);
  return socket;
};

const join = (socket, sessionId, userId, name = userId) => {
  let result;
  socket.send("moderation:join", { sessionId, userId, name }, (value) => {
    result = value;
  });
  return result;
};

const request = (socket, event, payload) => {
  let result;
  const ack = (value) => {
    result = value;
  };
  if (payload === undefined) socket.send(event, ack);
  else socket.send(event, payload, ack);
  return result;
};

test("serializes claims and restricts release, transfer, and referee view", () => {
  const io = makeIo();
  const alice = makeSocket(io);
  const bob = makeSocket(io);
  const sessionId = "moderation-claim-test";
  join(alice, sessionId, "alice", "Alice");
  join(bob, sessionId, "bob", "Bob");

  const claim = request(alice, "moderation:claim");
  assert.equal(claim.ok, true);
  assert.equal(request(bob, "moderation:claim").error, "role-taken");
  assert.equal(
    request(bob, "moderation:referee-view", { enabled: true }).error,
    "not-moderator"
  );
  assert.equal(request(bob, "moderation:release").error, "not-moderator");

  assert.equal(
    request(alice, "moderation:referee-view", { enabled: true }).state
      .refereeView,
    true
  );
  const transferred = request(alice, "moderation:transfer", { userId: "bob" });
  assert.equal(transferred.state.moderatorId, "bob");
  assert.equal(transferred.state.refereeView, false);
  assert.equal(request(alice, "moderation:release").error, "not-moderator");
  assert.equal(request(bob, "moderation:release").state.moderatorId, null);
});

test("keeps multi-tab presence and restores moderator only during reconnect grace", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"], now: 0 });
  const io = makeIo();
  const firstTab = makeSocket(io);
  const secondTab = makeSocket(io);
  const sessionId = "moderation-reconnect-test";
  join(firstTab, sessionId, "alice", "Alice");
  join(secondTab, sessionId, "alice", "Alice");
  request(firstTab, "moderation:claim");
  request(firstTab, "moderation:referee-view", { enabled: true });

  firstTab.send("disconnect");
  const session = moderationInternals.sessions.get(sessionId);
  assert.equal(session.users.size, 1);
  assert.equal(session.state.refereeView, true);

  secondTab.send("disconnect");
  assert.equal(session.state.refereeView, false);
  assert.ok(session.state.reconnectUntil);

  const reconnectedTab = makeSocket(io);
  join(reconnectedTab, sessionId, "alice", "Alice");
  assert.equal(session.state.moderatorId, "alice");
  assert.equal(session.state.reconnectUntil, null);

  reconnectedTab.send("disconnect");
  t.mock.timers.tick(moderationInternals.RECONNECT_GRACE_MS);
  assert.equal(session.state.moderatorId, null);
  assert.equal(session.state.refereeView, false);
  moderationInternals.sessions.delete(sessionId);
});
