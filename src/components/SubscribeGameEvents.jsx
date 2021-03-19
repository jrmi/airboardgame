import React from "react";

import { useC2C } from "../hooks/useC2C";

import useBoardConfig from "./useBoardConfig";

export const SubscribeGameEvents = ({ getGame, setGame }) => {
  const { c2c, joined, isMaster } = useC2C();

  const [, setBoardConfig] = useBoardConfig();

  // if first player register callback to allow other user to load game
  React.useEffect(() => {
    const unsub = [];
    if (joined && isMaster) {
      c2c
        .register("getGame", async () => {
          return await getGame();
        })
        .then((unregister) => {
          unsub.push(unregister);
        });
    }
    return () => {
      unsub.forEach((u) => u());
    };
  }, [c2c, getGame, isMaster, joined]);

  // Subscribe loadGame and updateBoardConfig events
  React.useEffect(() => {
    const unsub = [];
    unsub.push(
      c2c.subscribe("loadGame", (game) => {
        setGame(game);
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
  }, [c2c, setBoardConfig, setGame]);

  return null;
};

export default SubscribeGameEvents;
