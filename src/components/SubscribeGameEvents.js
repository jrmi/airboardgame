import React from "react";
import { useSetRecoilState, useRecoilCallback } from "recoil";

import { useC2C } from "../hooks/useC2C";

import { useItems } from "../components/Board/Items";
import {
  AvailableItemListAtom,
  AllItemsSelector,
  BoardConfigAtom,
} from "./Board";
import useBoardConfig from "./useBoardConfig";

import { nanoid } from "nanoid";

const fetchGame = async (url) => {
  const result = await fetch(url);
  return await result.json();
};

export const SubscribeGameEvents = () => {
  const [c2c, joined, isMaster] = useC2C();
  const { setItemList } = useItems();
  const setAvailableItemList = useSetRecoilState(AvailableItemListAtom);
  const [, setBoardConfig] = useBoardConfig();

  const [gameLoaded, setGameLoaded] = React.useState(false);
  const gameLoadingRef = React.useRef(false);

  const loadGame = React.useCallback(
    (game) => {
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
      setBoardConfig(game.board, false);
    },
    [setAvailableItemList, setBoardConfig, setItemList]
  );

  const getCurrentGame = useRecoilCallback(
    ({ snapshot }) => async () => {
      const availableItemList = await snapshot.getPromise(
        AvailableItemListAtom
      );
      const boardConfig = await snapshot.getPromise(BoardConfigAtom);
      const itemList = await snapshot.getPromise(AllItemsSelector);
      const game = {
        items: itemList,
        board: boardConfig,
        availableItems: availableItemList,
      };
      return game;
    },
    []
  );

  // if first player register callback to allow other use to load game
  React.useEffect(() => {
    const unsub = [];
    if (joined && isMaster) {
      c2c
        .register("getGame", async () => {
          return await getCurrentGame();
        })
        .then((unregister) => {
          unsub.push(unregister);
        });
    }
    return () => {
      unsub.forEach((u) => u());
    };
  }, [c2c, getCurrentGame, isMaster, joined]);

  // Subscribe loadGame and updateBoardConfig events
  React.useEffect(() => {
    const unsub = [];
    unsub.push(
      c2c.subscribe("loadGame", (game) => {
        loadGame(game);
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
  }, [c2c, setBoardConfig, loadGame]);

  // Load game from master if any
  React.useEffect(() => {
    if (!gameLoaded && joined && !isMaster && !gameLoadingRef.current) {
      gameLoadingRef.current = true;
      c2c.call("getGame").then(
        (game) => {
          setGameLoaded(true);
          loadGame(game);
        },
        () => {}
      );
    }
  }, [c2c, isMaster, joined, gameLoaded, loadGame]);
  return null;
};

export default SubscribeGameEvents;
