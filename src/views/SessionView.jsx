import React from "react";
import { useSetRecoilState } from "recoil";
import { useParams } from "react-router-dom";
import { nanoid } from "nanoid";
import { Provider } from "@scripters/use-socket.io";

import { C2CProvider, useC2C } from "../hooks/useC2C";
import { MessagesAtom, parseMessage } from "../hooks/useMessage";

import { SOCKET_URL, SOCKET_OPTIONS } from "../utils/settings";

import BoardView from "../views/BoardView";
import Waiter from "../ui/Waiter";

import { getGame, getSession } from "../utils/api";

import GameProvider from "../hooks/useGame";
import { useTranslation } from "react-i18next";

import useAsyncEffect from "use-async-effect";

export const SessionView = ({ session }) => {
  const { c2c, isMaster } = useC2C();
  const { gameId } = useParams();
  const [realGameId, setRealGameId] = React.useState();
  const [gameLoaded, setGameLoaded] = React.useState(false);
  const [game, setGame] = React.useState(null);
  const gameLoadingRef = React.useRef(false);
  const setMessages = useSetRecoilState(MessagesAtom);

  const { t } = useTranslation();

  useAsyncEffect(
    async (isMounted) => {
      if (isMaster && !gameLoaded && !gameLoadingRef.current) {
        gameLoadingRef.current = true;
        try {
          let gameData;

          // Load game from server
          try {
            // First from session if exists
            gameData = await getSession(session);
          } catch {
            // Then from initial game
            gameData = await getGame(gameId);
          }

          setRealGameId(gameId);

          // Add id if necessary
          gameData.items = gameData.items.map((item) => ({
            ...item,
            id: nanoid(),
          }));

          if (!isMounted) return;

          setGame(gameData);
          const { messages = [] } = gameData;
          setMessages(messages.map((m) => parseMessage(m)));

          // Send loadGame event for other user
          c2c.publish("loadGame", gameData);

          setGameLoaded(true);
        } catch (e) {
          console.log(e);
        }
      }
    },
    [c2c, gameId, gameLoaded, isMaster, session, setMessages, t]
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

  if (!gameLoaded) {
    return <Waiter message={t("Game loading...")} />;
  }

  return (
    <GameProvider game={game} gameId={realGameId}>
      <BoardView namespace={realGameId} session={session} />
    </GameProvider>
  );
};

const ConnectedSessionView = () => {
  const { room = nanoid() } = useParams();
  return (
    <Provider url={SOCKET_URL} options={SOCKET_OPTIONS}>
      <C2CProvider room={room}>
        <SessionView session={room} />
      </C2CProvider>
    </Provider>
  );
};

export default ConnectedSessionView;
