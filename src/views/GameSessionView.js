import React from "react";
import { BoardView } from "./BoardView";

import { useC2C } from "../hooks/useC2C";
import { getGame } from "../utils/api";

import SubscribeGameEvents from "../components/SubscribeGameEvents";
import { useSetRecoilState, useRecoilCallback } from "recoil";

import { useItems } from "../components/Board/Items";

import {
  AvailableItemListAtom,
  AllItemsSelector,
  BoardConfigAtom,
} from "../components/Board";

import useBoardConfig from "../components/useBoardConfig";

import { nanoid } from "nanoid";

export const GameSessionView = ({ gameId, room }) => {
  const [c2c, joined, isMaster] = useC2C();
  const { setItemList } = useItems();
  const setAvailableItemList = useSetRecoilState(AvailableItemListAtom);
  const [, setBoardConfig] = useBoardConfig();

  const [gameLoaded, setGameLoaded] = React.useState(false);
  const gameLoadingRef = React.useRef(false);

  const sendLoadGameEvent = React.useCallback(
    (game) => {
      game.items = game.items.map((item) => ({ ...item, id: nanoid() }));
      c2c.publish("loadGame", game);
    },
    [c2c]
  );

  const setGame = React.useCallback(
    async (game) => {
      setGameLoaded(true);
      const originalGame = await getGame(game.id);
      if (originalGame) {
        setAvailableItemList(
          originalGame.availableItems.map((item) => ({ id: nanoid(), ...item }))
        );
      } else {
        setAvailableItemList(game.availableItems);
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

  React.useEffect(() => {
    const loadGameData = async () => {
      const gameData = await getGame(gameId);
      setGame(gameData);
      sendLoadGameEvent(gameData);
    };
    if (isMaster && !gameLoaded) {
      gameLoadingRef.current = true;
      loadGameData();
    }
  }, [gameId, sendLoadGameEvent, isMaster, gameLoaded, setGame]);

  // Load game from master if any
  React.useEffect(() => {
    if (!gameLoaded && joined && !isMaster && !gameLoadingRef.current) {
      gameLoadingRef.current = true;
      c2c.call("getGame").then(setGame, () => {});
    }
  }, [c2c, isMaster, joined, gameLoaded, setGame]);

  return (
    <>
      <BoardView />
      <SubscribeGameEvents getGame={getCurrentGame} setGame={setGame} />
    </>
  );
};

export default GameSessionView;
