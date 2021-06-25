import React from "react";

import useC2C, { C2CProvider } from "../hooks/useC2C";

import { itemMap, useGameItemActionMap, ItemForm } from "../gameComponents";

import BoardView from "../views/BoardView";
import Waiter from "../ui/Waiter";

import { useUsers } from "../components/users";

import useSession, { SessionProvider } from "../hooks/useSession";

import AutoSaveSession from "./AutoSaveSession";
import { useTranslation } from "react-i18next";

import useAsyncEffect from "use-async-effect";

export const SessionView = () => {
  const {
    loadSession,
    setSession,
    sessionLoaded,
    gameId,
    sessionId,
  } = useSession();

  const { c2c, isMaster } = useC2C("board");

  const { actionMap } = useGameItemActionMap();

  const { setCurrentUser } = useUsers();

  const gameLoadingRef = React.useRef(false);

  const { t } = useTranslation();

  React.useEffect(() => {
    setCurrentUser((prev) => ({ ...prev, space: sessionId }));
  }, [sessionId, setCurrentUser]);

  useAsyncEffect(
    async (isMounted) => {
      if (isMaster && !sessionLoaded && !gameLoadingRef.current) {
        gameLoadingRef.current = true;
        const sessionData = await loadSession();
        if (!isMounted) return;
        setSession(sessionData, true);
      }
    },
    [c2c, sessionLoaded, isMaster]
  );

  // Load game from master if any
  React.useEffect(() => {
    if (!isMaster && !sessionLoaded && !gameLoadingRef.current) {
      gameLoadingRef.current = true;
      const onReceiveGame = (receivedSession) => {
        setSession(receivedSession);
      };
      c2c.call("getSession").then(onReceiveGame, () => {
        setTimeout(
          () =>
            c2c
              .call("getSession")
              .then(onReceiveGame, (error) =>
                console.log("Failed to call getSession with error", error)
              ),
          1000
        );
      });
    }
  }, [c2c, isMaster, sessionLoaded, setSession]);

  const mediaLibraries = React.useMemo(
    () =>
      gameId
        ? [
          {
            id: "session",
            name: t("Session"),
            boxId: "session",
            resourceId: sessionId,
          },
            { id: "game", name: t("Game"), boxId: "game", resourceId: gameId },
        ]
        : [
          {
            id: "session",
            name: t("Session"),
            boxId: "session",
            resourceId: sessionId,
          },
          ],
    [gameId, sessionId, t]
  );

  if (!sessionLoaded) {
    return <Waiter message={t("Session loading...")} />;
  }

  return (
    <>
      <AutoSaveSession />
      <BoardView
        mediaLibraries={mediaLibraries}
        itemMap={itemMap}
        actionMap={actionMap}
        ItemFormComponent={ItemForm}
      />
    </>
  );
};

const ConnectedSessionView = ({ sessionId, fromGame }) => {
  return (
    <C2CProvider room={sessionId} channel="board">
      <SessionProvider sessionId={sessionId} fromGameId={fromGame}>
        <SessionView />
      </SessionProvider>
    </C2CProvider>
  );
};

export default ConnectedSessionView;
