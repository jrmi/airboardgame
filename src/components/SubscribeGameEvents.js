import React from "react";
import { useRecoilState } from "recoil";

import { useC2C } from "../hooks/useC2C";

import { useItems } from "../components/Board/Items";
import { AvailableItemListAtom } from "./Board/game/atoms";
import useBoardConfig from "./useBoardConfig";

import { nanoid } from "nanoid";

const fetchGame = async (url) => {
  const result = await fetch(url);
  return await result.json();
};

export const SubscribeGameEvents = () => {
  const [c2c, joined, isMaster] = useC2C();
  const { itemList, setItemList } = useItems();
  const [availableItemList, setAvailableItemList] = useRecoilState(
    AvailableItemListAtom
  );
  const [boardConfig, setBoardConfig] = useBoardConfig();

  const [gameLoaded, setGameLoaded] = React.useState(false);
  const gameLoadingRef = React.useRef(false);

  const gameRef = React.useRef({
    items: itemList,
    board: boardConfig,
    availableItems: availableItemList,
  });

  gameRef.current = {
    items: itemList,
    board: boardConfig,
    availableItems: availableItemList,
  };

  React.useEffect(() => {
    const unsub = [];
    if (joined && isMaster) {
      c2c
        .register("getGame", () => {
          return gameRef.current;
        })
        .then((unregister) => {
          unsub.push(unregister);
        });
    }
    return () => {
      unsub.forEach((u) => u());
    };
  }, [c2c, isMaster, joined]);

  React.useEffect(() => {
    const unsub = [];
    unsub.push(
      c2c.subscribe("loadGame", (game) => {
        if (game.board.url) {
          fetchGame(game.board.url).then((result) => {
            setAvailableItemList(
              result.availableItems.map((item) => ({ id: nanoid(), ...item }))
            );
          });
        } else {
          setAvailableItemList(
            game.availableItems.map((item) => ({ id: nanoid(), ...item }))
          );
        }
        setItemList(game.items);
        setBoardConfig(game.board);
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
  }, [c2c, setAvailableItemList, setItemList, setBoardConfig]);

  // Load game from master if any
  React.useEffect(() => {
    if (!gameLoaded && joined && !isMaster && !gameLoadingRef.current) {
      gameLoadingRef.current = true;
      c2c.call("getGame").then(
        (game) => {
          setGameLoaded(true);
          setAvailableItemList(game.availableItems);
          setItemList(game.items);
          setBoardConfig(game.board);
        },
        () => {}
      );
    }
  }, [
    c2c,
    isMaster,
    joined,
    setAvailableItemList,
    setItemList,
    setBoardConfig,
    gameLoaded,
  ]);
  return null;
};

export default SubscribeGameEvents;
