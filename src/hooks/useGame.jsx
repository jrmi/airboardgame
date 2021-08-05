import React, { useContext } from "react";

import { updateGame } from "../utils/api";

import { useBoardConfig } from "react-sync-board";

export const GameContext = React.createContext({});

export const GameProvider = ({ gameId, game, children }) => {
  const [items, setItems] = React.useState([]);
  const [availableItems, setAvailableItems] = React.useState([]);
  const [boardConfig, setBoardConfig] = useBoardConfig();

  const [gameLoaded, setGameLoaded] = React.useState(false);

  const setGame = React.useCallback(
    async (newGame) => {
      setAvailableItems(newGame.availableItems);
      // The filter prevent the empty item bug on reload
      setItems(newGame.items.filter((item) => item));
      setBoardConfig(newGame.board, false);
      setGameLoaded(true);
    },
    [setBoardConfig]
  );

  const getCurrentGame = React.useCallback(async () => {
    const currentGame = {
      items,
      board: boardConfig,
      availableItems,
    };
    return currentGame;
  }, [availableItems, boardConfig, items]);

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
