import React from "react";
import { useParams } from "react-router-dom";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";
import useAsyncEffect from "use-async-effect";

import useC2C, { C2CProvider } from "../components/hooks/useC2C";
import { GameProvider } from "../hooks/useGame";
import BoardView from "./BoardView";
import { getGame } from "../utils/api";

import { itemMap, useGameItemActionMap, ItemForm } from "../gameComponents";

import Waiter from "./Waiter";

const newGameData = {
  items: [],
  availableItems: [],
  board: { size: 2000, scale: 1 },
};

export const GameView = () => {
  const { c2c, isMaster } = useC2C("board");
  const { gameId } = useParams();
  const { actionMap } = useGameItemActionMap();
  const [realGameId, setRealGameId] = React.useState();
  const [gameLoaded, setGameLoaded] = React.useState(false);
  const [game, setGame] = React.useState(null);
  const gameLoadingRef = React.useRef(false);

  const { t } = useTranslation();

  useAsyncEffect(
    async (isMounted) => {
      if (isMaster && !gameLoaded && !gameLoadingRef.current) {
        gameLoadingRef.current = true;
        try {
          let gameData;
          let newRealGameId = gameId;

          if (!gameId) {
            // Create new game
            newGameData.board.defaultName = t("New game");
            gameData = JSON.parse(JSON.stringify(newGameData));
            newRealGameId = nanoid();
          } else {
            // Load game from server
            gameData = await getGame(gameId);
          }
          if (!isMounted) return;

          setRealGameId(newRealGameId);
          setGame(gameData);
          setGameLoaded(true);
        } catch (e) {
          console.log(e);
        }
      }
    },
    [c2c, gameId, gameLoaded, isMaster, t]
  );

  // Load game from master if any
  React.useEffect(() => {
    if (!isMaster && !gameLoaded && !gameLoadingRef.current) {
      gameLoadingRef.current = true;
      const onReceiveGame = (receivedGame) => {
        setGame(receivedGame);
        setGameLoaded(true);
      };
      c2c.call("getGame").then(onReceiveGame, () => {
        setTimeout(
          c2c
            .call("getGame")
            .then(onReceiveGame, (error) =>
              console.log("Failed to call getGame with error", error)
            ),
          1000
        );
      });
    }
  }, [c2c, isMaster, gameLoaded]);

  const libraries = React.useMemo(
    () => [
      { id: "game", name: t("Game"), boxId: "game", resourceId: realGameId },
    ],
    [realGameId, t]
  );

  if (!gameLoaded) {
    return <Waiter message={t("Game loading...")} />;
  }

  return (
    <GameProvider game={game} gameId={realGameId}>
      <BoardView
        edit={true}
        mediaLibraries={libraries}
        itemMap={itemMap}
        actionMap={actionMap}
        ItemFormComponent={ItemForm}
      />
    </GameProvider>
  );
};

const ConnectedGameView = () => {
  const { room = nanoid() } = useParams();
  return (
    <C2CProvider room={room} channel="board">
      <GameView />
    </C2CProvider>
  );
};

export default ConnectedGameView;
