import React from "react";
import { useUsers, useWire } from "react-sync-board";

const ModerationContext = React.createContext(null);
const emptyState = {
  moderatorId: null,
  moderatorName: null,
  reconnectUntil: null,
  refereeView: false,
  connectedUsers: [],
};

export const ModerationProvider = ({ children }) => {
  const { wire, isMaster } = useWire("room");
  const { currentUser, localUsers } = useUsers();
  const usersRef = React.useRef(localUsers);
  usersRef.current = localUsers;
  const userIdsRef = React.useRef(new Map());
  localUsers.forEach(({ id, uid }) => userIdsRef.current.set(id, uid));
  const wireRef = React.useRef(wire);
  wireRef.current = wire;
  const [state, setState] = React.useState({
    moderatorId: null,
    moderatorName: null,
    reconnectUntil: null,
    refereeView: false,
    connectedUsers: [],
  });
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
      wireRef.current?.publish("moderationState", nextState, true);
    },
    [updateState]
  );

  React.useEffect(() => {
    if (!wire || !currentUser?.uid) return undefined;
    const update = (nextState) => updateState(nextState);
    const markUserDisconnected = (wireUserId) => {
      const userId = userIdsRef.current.get(wireUserId);
      const hasOtherConnection = usersRef.current.some(
        ({ id, uid }) => uid === userId && id !== wireUserId
      );
      userIdsRef.current.delete(wireUserId);
      if (hasOtherConnection || userId !== stateRef.current.moderatorId) return;
      const reconnectUntil = Date.now() + 30_000;
      const nextState = {
        ...stateRef.current,
        reconnectUntil,
        refereeView: false,
      };
      publishState(nextState);
      clearTimeout(expiryRef.current);
      expiryRef.current = setTimeout(() => {
        if (stateRef.current.moderatorId !== userId) return;
        publishState({ ...emptyState, connectedUsers: [] });
      }, 30_000);
    };
    const onUserLeave = (wireUserId) => {
      if (isMaster) {
        markUserDisconnected(wireUserId);
        return;
      }
      let attempts = 0;
      const notifyMaster = () =>
        wire.call("moderationUserLeave", { wireUserId }).catch(() => {
          attempts += 1;
          if (!cancelled && attempts < 10) setTimeout(notifyMaster, 250);
        });
      notifyMaster();
    };
    const unsubscribeState = wire.subscribe("moderationState", update);
    const unsubscribeUserLeave = wire.subscribe("userLeave", onUserLeave);

    let unregister = [];
    let cancelled = false;
    const setModerator = (moderatorId) => {
      if (moderatorId && expiryRef.current) {
        clearTimeout(expiryRef.current);
        expiryRef.current = null;
      }
    };
    const nextState = (overrides = {}) => ({
      ...stateRef.current,
      connectedUsers: usersRef.current.map(({ name }) => ({ name })),
      ...overrides,
    });

    if (isMaster) {
      const register = async () => {
        const methods = [
          ["moderationGetState", () => stateRef.current],
          [
            "moderationUserLeave",
            ({ wireUserId } = {}) => {
              markUserDisconnected(wireUserId);
              return stateRef.current;
            },
          ],
          [
            "moderationClaim",
            ({ userId, name } = {}) => {
              const current = stateRef.current;
              if (current.moderatorId && current.moderatorId !== userId) {
                throw new Error("role-taken");
              }
              setModerator(userId);
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
              const released = {
                ...emptyState,
                connectedUsers: usersRef.current.map(({ name }) => ({ name })),
              };
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
              setModerator(targetId);
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
            publishState({ ...emptyState, connectedUsers: [] });
          else
            expiryRef.current = setTimeout(() => {
              publishState({ ...emptyState, connectedUsers: [] });
            }, remaining);
        }
        publishState(nextState());
      };
      register().catch(() => {});
    } else {
      let attempts = 0;
      const getState = () =>
        wire.call("moderationGetState").then(updateState, () => {
          attempts += 1;
          if (!cancelled && attempts < 5) setTimeout(getState, 250);
        });
      getState();
    }

    return () => {
      cancelled = true;
      unregister.forEach((remove) => remove());
      clearTimeout(expiryRef.current);
      unsubscribeState();
      unsubscribeUserLeave();
    };
  }, [currentUser?.uid, isMaster, publishState, updateState, wire]);

  React.useEffect(() => {
    if (!isMaster || !state.moderatorId || !state.reconnectUntil) return;
    if (!localUsers.some(({ uid }) => uid === state.moderatorId)) return;
    clearTimeout(expiryRef.current);
    expiryRef.current = null;
    publishState({ ...state, reconnectUntil: null });
  }, [isMaster, localUsers, publishState, state]);

  const request = React.useCallback(
    async (method, params = {}) => {
      if (!wire || !currentUser?.uid) throw new Error("wire-unavailable");
      const payload = {
        ...params,
        userId: currentUser.uid,
        name: currentUser.name,
      };
      for (let attempt = 0; ; attempt += 1) {
        try {
          const result = await wire.call(method, payload);
          if (result) updateState(result);
          return result;
        } catch (error) {
          if (attempt >= 9 || !String(error).includes("not registered")) {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, 200));
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
    state: emptyState,
    isModerator: false,
  };
