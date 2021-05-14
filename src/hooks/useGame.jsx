import React, { useContext } from "react";
import { useSetRecoilState, useRecoilCallback } from "recoil";

import { updateGame } from "../utils/api";

import { useItems } from "../components/Board/Items";
import {
  AvailableItemListAtom,
  AllItemsSelector,
  BoardConfigAtom,
} from "../components/Board";
import useBoardConfig from "../components/useBoardConfig";

export const GameContext = React.createContext({});

export const GameProvider = ({ gameId, game, children }) => {
  const { setItemList } = useItems();
  const setAvailableItemList = useSetRecoilState(AvailableItemListAtom);
  const [, setBoardConfig] = useBoardConfig();

  const [gameLoaded, setGameLoaded] = React.useState(false);

  const setGame = React.useCallback(
    async (newGame) => {
      setAvailableItemList(newGame.availableItems);
      // The filter prevent the empty item bug on reload
      setItemList(newGame.items.filter((item) => item));
      setBoardConfig(newGame.board, false);
      setGameLoaded(true);
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
      const currentGame = {
        items: itemList,
        board: boardConfig,
        availableItems: availableItemList,
      };
      return currentGame;
    },
    []
  );

  const saveGame = React.useCallback(async () => {
    const currentGame = await getCurrentGame();
    return updateGame(gameId, currentGame);
  }, [gameId, getCurrentGame]);

  React.useEffect(() => {
    if (game) {
      setGame(game);
    }
  }, [game, setGame]);

  return (
    <GameContext.Provider
      value={{ setGame, getGame: getCurrentGame, saveGame, gameLoaded, gameId }}
    >
      {gameLoaded && children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  return useContext(GameContext);
};

export default useGame;
