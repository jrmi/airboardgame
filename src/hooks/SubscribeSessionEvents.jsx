import debounce from "lodash.debounce";
import React from "react";

import { useWire, useBoardConfig } from "react-sync-board";

export const SubscribeSessionEvents = ({ getSession, setSession }) => {
  const { wire, isMaster } = useWire("board");

  const [, setBoardConfig] = useBoardConfig();

  // Use ref to avoid too fast register and unregister
  const getSessionRef = React.useRef(getSession);
  getSessionRef.current = getSession;

  // if first player register callback to allow other user to load game
  React.useEffect(() => {
    const unsub = [];
    if (isMaster) {
      wire
        .register("getSession", async () => {
          return await getSessionRef.current();
        })
        .then((unregister) => {
          unsub.push(unregister);
        });
    }
    return () => {
      unsub.forEach((u) => u());
    };
  }, [wire, isMaster]);

  // Subscribe loadSession and updateBoardConfig events
  React.useEffect(() => {
    const unsub = [];
    unsub.push(
      wire.subscribe("loadSession", (session) => {
        setSession(session);
      })
    );
    return () => {
      unsub.forEach((u) => u());
    };
  }, [wire, setBoardConfig, setSession]);

  return null;
};

export default SubscribeSessionEvents;
