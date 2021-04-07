import React, { useContext } from "react";
import { useSetRecoilState, useRecoilCallback } from "recoil";
import { nanoid } from "nanoid";

import { getGame } from "../utils/api";

import SubscribeGameEvents from "../components/SubscribeGameEvents";
import { useItems } from "../components/Board/Items";
import {
  AvailableItemListAtom,
  AllItemsSelector,
  BoardConfigAtom,
} from "../components/Board";
import useBoardConfig from "../components/useBoardConfig";

import { uploadResourceImage } from "../utils/api";

export const GameContext = React.createContext({});

export const GameProvider = ({ gameId, game, children }) => {
  const { setItemList } = useItems();
  const setAvailableItemList = useSetRecoilState(AvailableItemListAtom);
  const [, setBoardConfig] = useBoardConfig();

  const [gameLoaded, setGameLoaded] = React.useState(false);

  const setGame = React.useCallback(
    async (newGame) => {
      try {
        const originalGame = await getGame(gameId);
        setAvailableItemList(
          originalGame.availableItems.map((item) => ({
            ...item,
            id: nanoid(),
          }))
        );
      } catch {
        setAvailableItemList(
          newGame.availableItems.map((item) => ({ ...item, id: nanoid() }))
        );
      }
      setItemList(newGame.items.filter((item) => item)); // The filter avoid the empty item bug on reload
      setBoardConfig(newGame.board, false);
      setGameLoaded(true);
    },
    [setAvailableItemList, setBoardConfig, setItemList, gameId]
  );

  const getCurrentGame = useRecoilCallback(
    ({ snapshot }) => async () => {
      const availableItemList = await snapshot.getPromise(
        AvailableItemListAtom
      );
      const boardConfig = await snapshot.getPromise(BoardConfigAtom);
      const itemList = await snapshot.getPromise(AllItemsSelector);
      const currentGame = {
        items: itemList,
        board: boardConfig,
        availableItems: availableItemList,
      };
      return currentGame;
    },
    []
  );

  React.useEffect(() => {
    if (game) {
      setGame(game);
    }
  }, [game, setGame]);

  return (
    <GameContext.Provider
      value={{ setGame, getGame: getCurrentGame, gameId, gameLoaded }}
    >
      {gameLoaded && children}
      <SubscribeGameEvents getGame={getCurrentGame} setGame={setGame} />
    </GameContext.Provider>
  );
};

export const useGame = () => {
  return useContext(GameContext);
};

export default GameProvider;
