import React from "react";
import { useSessionInfo, useUsers, useWire } from "react-sync-board";

const ModerationContext = React.createContext(null);
const RECONNECT_GRACE_MS = 30_000;
const METHOD_CALL_RETRY_DELAY_MS = 200;
const MAX_METHOD_CALL_ATTEMPTS = 10;
const MODERATION_METHODS = {
  claim: "moderationClaim",
  release: "moderationRelease",
  transfer: "moderationTransfer",
  setRefereeView: "moderationRefereeView",
};

const createEmptyState = () => ({
  moderatorId: null,
  moderatorName: null,
  reconnectUntil: null,
  refereeView: false,
});

export const ModerationProvider = ({ children }) => {
  const { wire, isMaster } = useWire("room");
  const { currentUser, localUsers } = useUsers();
  const { sessionInfo, updateSessionInfo } = useSessionInfo();
  const state = sessionInfo.moderation || createEmptyState();

  // Wire callbacks can outlive a render; refs keep them pointed at current data.
  const usersRef = React.useRef(localUsers);
  usersRef.current = localUsers;
  const stateRef = React.useRef(state);
  stateRef.current = state;

  const publishState = React.useCallback(
    (nextState) => {
      stateRef.current = nextState;
      // sessionInfo is synchronized already and is not part of saved board data.
      updateSessionInfo({ moderation: nextState });
    },
    [updateSessionInfo]
  );

  React.useEffect(() => {
    if (!wire || !currentUser?.uid) return undefined;

    let unregister = [];
    let cancelled = false;
    const nextState = (overrides = {}) => ({
      ...stateRef.current,
      ...overrides,
    });

    if (isMaster) {
      // Only the room master registers mutations; peers send requests to it.
      const register = async () => {
        const methods = [
          [
            "moderationClaim",
            ({ userId, name } = {}) => {
              const current = stateRef.current;
              if (current.moderatorId && current.moderatorId !== userId) {
                throw new Error("role-taken");
              }
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
      };
      register().catch(() => {});
    }

    return () => {
      cancelled = true;
      unregister.forEach((remove) => remove());
    };
  }, [currentUser?.uid, isMaster, publishState, wire]);

  React.useEffect(() => {
    if (!isMaster || !state.moderatorId) return undefined;

    const moderatorIsConnected = localUsers.some(
      ({ uid }) => uid === state.moderatorId
    );
    if (moderatorIsConnected) {
      if (state.reconnectUntil) {
        publishState({ ...state, reconnectUntil: null });
      }
      return undefined;
    }

    const moderatorId = state.moderatorId;
    if (!state.reconnectUntil) {
      // useUsers tracks userLeave; retain the role during a short reconnect grace period.
      publishState({
        ...state,
        reconnectUntil: Date.now() + RECONNECT_GRACE_MS,
        refereeView: false,
      });
      return undefined;
    }

    const remaining = state.reconnectUntil - Date.now();
    if (remaining <= 0) {
      publishState(createEmptyState());
      return undefined;
    }

    const expiryTimer = setTimeout(() => {
      if (stateRef.current.moderatorId !== moderatorId) return;
      if (usersRef.current.some(({ uid }) => uid === moderatorId)) return;
      publishState(createEmptyState());
    }, remaining);

    return () => clearTimeout(expiryTimer);
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
    [currentUser?.name, currentUser?.uid, wire]
  );

  const requestModeration = React.useCallback(
    (action, params = {}) => {
      const method = MODERATION_METHODS[action];
      if (!method) throw new Error("unknown-moderation-action");
      return request(method, params);
    },
    [request]
  );

  const value = React.useMemo(
    () => ({
      state,
      isModerator: state.moderatorId === currentUser?.uid,
      requestModeration,
    }),
    [currentUser?.uid, requestModeration, state]
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
