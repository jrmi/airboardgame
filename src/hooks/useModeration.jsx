import React from "react";
import { useUsers, useWire } from "react-sync-board";

const ModerationContext = React.createContext(null);
const RECONNECT_GRACE_MS = 30_000;
const STATE_REQUEST_RETRY_DELAY_MS = 250;
const METHOD_CALL_RETRY_DELAY_MS = 200;
const MAX_STATE_REQUEST_ATTEMPTS = 5;
const MAX_METHOD_CALL_ATTEMPTS = 10;

const createEmptyState = () => ({
  moderatorId: null,
  moderatorName: null,
  reconnectUntil: null,
  refereeView: false,
});

export const ModerationProvider = ({ children }) => {
  const { wire, isMaster } = useWire("room");
  const { currentUser, localUsers } = useUsers();

  // Wire callbacks can outlive a render; refs keep them pointed at current data.
  const usersRef = React.useRef(localUsers);
  usersRef.current = localUsers;
  const wireRef = React.useRef(wire);
  wireRef.current = wire;
  const [state, setState] = React.useState(createEmptyState);
  const stateRef = React.useRef(state);
  stateRef.current = state;
  const expiryRef = React.useRef(null);

  const updateState = React.useCallback((nextState) => {
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  const publishState = React.useCallback(
    (nextState) => {
      updateState(nextState);
      // Update local state immediately and broadcast it to every peer.
      wireRef.current?.publish("moderationState", nextState, true);
    },
    [updateState]
  );

  React.useEffect(() => {
    if (!wire || !currentUser?.uid) return undefined;
    const update = (nextState) => updateState(nextState);
    const unsubscribeState = wire.subscribe("moderationState", update);

    let unregister = [];
    let cancelled = false;
    const clearExpiryTimer = () => {
      clearTimeout(expiryRef.current);
      expiryRef.current = null;
    };
    const nextState = (overrides = {}) => ({
      ...stateRef.current,
      ...overrides,
    });

    if (isMaster) {
      // Only the room master registers mutations; peers send requests to it.
      const register = async () => {
        const methods = [
          ["moderationGetState", () => stateRef.current],
          [
            "moderationClaim",
            ({ userId, name } = {}) => {
              const current = stateRef.current;
              if (current.moderatorId && current.moderatorId !== userId) {
                throw new Error("role-taken");
              }
              clearExpiryTimer();
              const claimed = nextState({
                moderatorId: userId,
                moderatorName: name || "",
                reconnectUntil: null,
                refereeView: false,
              });
              publishState(claimed);
              return claimed;
            },
          ],
          [
            "moderationRelease",
            ({ userId } = {}) => {
              if (stateRef.current.moderatorId !== userId)
                throw new Error("not-moderator");
              clearExpiryTimer();
              const released = createEmptyState();
              publishState(released);
              return released;
            },
          ],
          [
            "moderationTransfer",
            ({ userId, targetId } = {}) => {
              if (stateRef.current.moderatorId !== userId)
                throw new Error("not-moderator");
              const target = usersRef.current.find(
                ({ uid }) => uid === targetId
              );
              if (!target) throw new Error("target-offline");
              const transferred = nextState({
                moderatorId: targetId,
                moderatorName: target.name || "",
                reconnectUntil: null,
                refereeView: false,
              });
              clearExpiryTimer();
              publishState(transferred);
              return transferred;
            },
          ],
          [
            "moderationRefereeView",
            ({ userId, enabled } = {}) => {
              if (stateRef.current.moderatorId !== userId)
                throw new Error("not-moderator");
              const updated = nextState({ refereeView: enabled === true });
              publishState(updated);
              return updated;
            },
          ],
        ];
        for (const [name, callback] of methods) {
          const remove = await wire.register(name, callback);
          if (cancelled) remove();
          else unregister.push(remove);
        }
        if (cancelled) return;
        if (stateRef.current.moderatorId && stateRef.current.reconnectUntil) {
          const remaining = stateRef.current.reconnectUntil - Date.now();
          if (remaining <= 0)
            publishState(createEmptyState());
          else
            expiryRef.current = setTimeout(() => {
              publishState(createEmptyState());
            }, remaining);
        }
        publishState(nextState());
      };
      register().catch(() => {});
    } else {
      // A peer may join before the master has finished registering its methods.
      let attempts = 0;
      const getState = () =>
        wire.call("moderationGetState").then(updateState, () => {
          attempts += 1;
          if (!cancelled && attempts < MAX_STATE_REQUEST_ATTEMPTS) {
            setTimeout(getState, STATE_REQUEST_RETRY_DELAY_MS);
          }
        });
      getState();
    }

    return () => {
      cancelled = true;
      unregister.forEach((remove) => remove());
      clearTimeout(expiryRef.current);
      unsubscribeState();
    };
  }, [currentUser?.uid, isMaster, publishState, updateState, wire]);

  React.useEffect(() => {
    if (!isMaster || !state.moderatorId) return;

    const moderatorIsConnected = localUsers.some(
      ({ uid }) => uid === state.moderatorId
    );
    if (moderatorIsConnected) {
      if (!state.reconnectUntil) return;
      clearTimeout(expiryRef.current);
      expiryRef.current = null;
      publishState({ ...state, reconnectUntil: null });
      return;
    }

    if (state.reconnectUntil) return;

    // useUsers tracks userLeave; retain the role during a short reconnect grace period.
    const moderatorId = state.moderatorId;
    publishState({
      ...state,
      reconnectUntil: Date.now() + RECONNECT_GRACE_MS,
      refereeView: false,
    });
    clearTimeout(expiryRef.current);
    expiryRef.current = setTimeout(() => {
      if (stateRef.current.moderatorId !== moderatorId) return;
      if (usersRef.current.some(({ uid }) => uid === moderatorId)) return;
      expiryRef.current = null;
      publishState(createEmptyState());
    }, RECONNECT_GRACE_MS);
  }, [isMaster, localUsers, publishState, state]);

  const request = React.useCallback(
    async (method, params = {}) => {
      if (!wire || !currentUser?.uid) throw new Error("wire-unavailable");
      const payload = {
        ...params,
        userId: currentUser.uid,
        name: currentUser.name,
      };
      // Retry only the startup race where the master has not registered yet.
      for (let attempt = 1; ; attempt += 1) {
        try {
          const result = await wire.call(method, payload);
          if (result) updateState(result);
          return result;
        } catch (error) {
          if (
            attempt >= MAX_METHOD_CALL_ATTEMPTS ||
            !String(error).includes("not registered")
          ) {
            throw error;
          }
          await new Promise((resolve) =>
            setTimeout(resolve, METHOD_CALL_RETRY_DELAY_MS)
          );
        }
      }
    },
    [currentUser?.name, currentUser?.uid, updateState, wire]
  );

  const value = React.useMemo(
    () => ({
      state,
      isModerator: state.moderatorId === currentUser?.uid,
      claim: () => request("moderationClaim"),
      release: () => request("moderationRelease"),
      transfer: (targetId) => request("moderationTransfer", { targetId }),
      setRefereeView: (enabled) =>
        request("moderationRefereeView", { enabled }),
    }),
    [currentUser?.uid, request, state]
  );

  return (
    <ModerationContext.Provider value={value}>
      {children}
    </ModerationContext.Provider>
  );
};

export const useModeration = () =>
  React.useContext(ModerationContext) || {
    state: createEmptyState(),
    isModerator: false,
  };
