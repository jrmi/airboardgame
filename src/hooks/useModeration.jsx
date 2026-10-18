import React from "react";
import { useSocket } from "@jrmi/use-socket.io";
import { useUsers } from "react-sync-board";

const ModerationContext = React.createContext(null);
const emptyState = {
  moderatorId: null,
  moderatorName: null,
  reconnectUntil: null,
  refereeView: false,
  connectedUsers: [],
};

export const ModerationProvider = ({ sessionId, children }) => {
  const socket = useSocket();
  const { currentUser } = useUsers();
  const [state, setState] = React.useState({
    moderatorId: null,
    moderatorName: null,
    reconnectUntil: null,
    refereeView: false,
    connectedUsers: [],
  });

  React.useEffect(() => {
    if (!socket || !currentUser?.uid) return undefined;
    const update = (nextState) => setState(nextState);
    const join = () =>
      socket.emit(
        "moderation:join",
        { sessionId, userId: currentUser.uid, name: currentUser.name },
        (result) => result?.ok && setState(result.state)
      );
    socket.on("moderation:state", update);
    socket.on("connect", join);
    if (socket.connected) join();
    return () => {
      socket.off("moderation:state", update);
      socket.off("connect", join);
      socket.emit("moderation:leave");
    };
  }, [currentUser?.name, currentUser?.uid, sessionId, socket]);

  const request = React.useCallback(
    (event, data) =>
      new Promise((resolve, reject) => {
        if (!socket) {
          reject(new Error("socket-unavailable"));
          return;
        }
        const acknowledge = (result) => {
          if (!result?.ok) {
            if (result?.state) setState(result.state);
            reject(new Error(result?.error || "request-failed"));
            return;
          }
          if (result.state) setState(result.state);
          resolve(result.state);
        };
        if (data === undefined) socket.emit(event, acknowledge);
        else socket.emit(event, data, acknowledge);
      }),
    [socket]
  );

  const value = React.useMemo(
    () => ({
      state,
      isModerator: state.moderatorId === currentUser?.uid,
      claim: () => request("moderation:claim"),
      release: () => request("moderation:release"),
      transfer: (userId) => request("moderation:transfer", { userId }),
      setRefereeView: (enabled) =>
        request("moderation:referee-view", { enabled }),
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
