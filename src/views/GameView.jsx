import React from "react";
import { useSetRecoilState } from "recoil";
import { useParams } from "react-router-dom";
import { nanoid } from "nanoid";
import { Provider } from "@scripters/use-socket.io";

import { C2CProvider, useC2C } from "../hooks/useC2C";
import { MessagesAtom } from "../hooks/useMessage";

import { SOCKET_URL, SOCKET_OPTIONS } from "../utils/settings";

import BoardView from "../views/BoardView";
import Waiter from "../ui/Waiter";

import { getGame } from "../utils/api";

import GameProvider from "../hooks/useGame";
import { useTranslation } from "react-i18next";

const newGameData = {
  items: [],
  availableItems: [],
  board: { size: 2000, scale: 1, name: "New game" },
};

export const GameView = ({ session }) => {
  const { c2c, isMaster } = useC2C();
  const { gameId } = useParams();
  const [realGameId, setRealGameId] = React.useState();
  const [gameLoaded, setGameLoaded] = React.useState(false);
  const [game, setGame] = React.useState(null);
  const gameLoadingRef = React.useRef(false);
  const setMessages = useSetRecoilState(MessagesAtom);

  const { t } = useTranslation();

  React.useEffect(() => {
    let isMounted = true;

    const loadGameInitialData = async () => {
      try {
        let gameData;

        if (!gameId) {
          // Create new game
          newGameData.board.name = t("New game");
          gameData = JSON.parse(JSON.stringify(newGameData));
          setRealGameId(nanoid());
        } else {
          // Load game from server
          gameData = await getGame(gameId);

          setRealGameId(gameId);
        }

        // Add id if necessary
        gameData.items = gameData.items.map((item) => ({
          ...item,
          id: nanoid(),
        }));

        if (!isMounted) return;

        setGame(gameData);

        setGameLoaded(true);
      } catch (e) {
        console.log(e);
      }
    };

    if (isMaster && !gameLoaded && !gameLoadingRef.current) {
      gameLoadingRef.current = true;
      loadGameInitialData();
    }

    return () => {
      isMounted = false;
    };
  }, [c2c, gameId, gameLoaded, isMaster, setMessages, t]);

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

  if (!gameLoaded) {
    return <Waiter message={t("Game loading...")} />;
  }

  return (
    <GameProvider game={game} gameId={realGameId}>
      <BoardView namespace={realGameId} edit={true} session={session} />
    </GameProvider>
  );
};

const ConnectedGameView = () => {
  const { room = nanoid() } = useParams();
  return (
    <Provider url={SOCKET_URL} options={SOCKET_OPTIONS}>
      <C2CProvider room={room}>
        <GameView session={room} />
      </C2CProvider>
    </Provider>
  );
};

export default ConnectedGameView;
