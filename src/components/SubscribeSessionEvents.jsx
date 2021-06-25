import React from "react";

import useC2C from "./hooks/useC2C";

import useBoardConfig from "./useBoardConfig";

export const SubscribeSessionEvents = ({ getSession, setSession }) => {
  const { c2c, isMaster } = useC2C("board");

  const [, setBoardConfig] = useBoardConfig();

  // if first player register callback to allow other user to load game
  React.useEffect(() => {
    const unsub = [];
    if (isMaster) {
      c2c
        .register("getSession", async () => {
          return await getSession();
        })
        .then((unregister) => {
          unsub.push(unregister);
        });
    }
    return () => {
      unsub.forEach((u) => u());
    };
  }, [c2c, getSession, isMaster]);

  // Subscribe loadSession and updateBoardConfig events
  React.useEffect(() => {
    const unsub = [];
    unsub.push(
      c2c.subscribe("loadSession", (session) => {
        setSession(session);
      })
    );
    unsub.push(
      c2c.subscribe("updateBoardConfig", (newConfig) => {
        setBoardConfig(newConfig, false);
      })
    );
    return () => {
      unsub.forEach((u) => u());
    };
  }, [c2c, setBoardConfig, setSession]);

  return null;
};

export default SubscribeSessionEvents;
