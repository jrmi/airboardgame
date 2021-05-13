import React from "react";
import { useSetRecoilState } from "recoil";
import { Provider } from "@scripters/use-socket.io";

import { C2CProvider, useC2C } from "../hooks/useC2C";
import { MessagesAtom, parseMessage } from "../hooks/useMessage";

import { SOCKET_URL, SOCKET_OPTIONS } from "../utils/settings";

import BoardView from "../views/BoardView";
import Waiter from "../ui/Waiter";

import { getGame, getSession } from "../utils/api";

import { SessionProvider } from "../hooks/useSession";
import { useTranslation } from "react-i18next";

import useAsyncEffect from "use-async-effect";

const emtpyBoard = {
  items: [],
  availableItems: [],
  board: {
    size: 1000,
    scale: 1,
    translations: [
      {
        language: "fr",
        name: "Choississez un jeu",
        description: "...",
      },
    ],
    defaultName: "Choose a game",
    defaultLanguage: "en",
    defaultDescription: "...",
    gridSize: 1,
  },
};

export const SessionView = ({ sessionId, fromGame }) => {
  const { c2c, isMaster } = useC2C();

  const [realGameId, setRealGameId] = React.useState();

  const [session, setSession] = React.useState();
  const [sessionLoaded, setSessionLoaded] = React.useState(false);

  const gameLoadingRef = React.useRef(false);
  const setMessages = useSetRecoilState(MessagesAtom);

  const { t } = useTranslation();

  let paramGameId = fromGame;

  useAsyncEffect(
    async (isMounted) => {
      if (isMaster && !sessionLoaded && !gameLoadingRef.current) {
        gameLoadingRef.current = true;
        try {
          let sessionData;

          // Init session from server
          try {
            // First from session if exists
            sessionData = await getSession(sessionId);
            paramGameId = sessionData.gameId || paramGameId;

            // Update availableItems from original game
            if (paramGameId) {
              const { availableItems } = await getGame(paramGameId);
              sessionData.availableItems = availableItems;
            }
          } catch {
            if (paramGameId) {
              // Then from initial game
              sessionData = await getGame(paramGameId);
            } else {
              // Empty board
              sessionData = emtpyBoard();
            }
          }

          if (!isMounted) return;

          setRealGameId(paramGameId);

          setSession(sessionData);
          const { messages = [] } = sessionData;
          setMessages(messages.map((m) => parseMessage(m)));

          // Send loadGame event for other user
          c2c.publish("loadGame", sessionData);

          setSessionLoaded(true);
        } catch (e) {
          console.log(e);
        }
      }
    },
    [c2c, paramGameId, sessionLoaded, isMaster, session, setMessages, t]
  );

  // Load game from master if any
  React.useEffect(() => {
    if (!isMaster && !sessionLoaded && !gameLoadingRef.current) {
      gameLoadingRef.current = true;
      const onReceiveGame = (receivedSession) => {
        setSession(receivedSession);
        setSessionLoaded(true);
      };
      c2c.call("getSession").then(onReceiveGame, () => {
        setTimeout(
          c2c
            .call("getSession")
            .then(onReceiveGame, (error) =>
              console.log("Failed to call getSession with error", error)
            ),
          1000
        );
      });
    }
  }, [c2c, isMaster, sessionLoaded]);

  if (!sessionLoaded) {
    return <Waiter message={t("Session loading...")} />;
  }

  return (
    <SessionProvider
      session={session}
      sessionId={sessionId}
      fromGameId={paramGameId}
    >
      <BoardView namespace={realGameId} session={session} />
    </SessionProvider>
  );
};

const ConnectedSessionView = ({ sessionId, fromGame }) => {
  return (
    <Provider url={SOCKET_URL} options={SOCKET_OPTIONS}>
      <C2CProvider room={sessionId}>
        <SessionView sessionId={sessionId} fromGame={fromGame} />
      </C2CProvider>
    </Provider>
  );
};

export default ConnectedSessionView;
