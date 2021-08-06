import React from "react";
import { useTranslation } from "react-i18next";
import useAsyncEffect from "use-async-effect";
import { BoardWrapper, useC2C } from "react-sync-board";
import { nanoid } from "nanoid";

import { itemTemplates, itemLibrary, actionMap } from "../gameComponents";

import BoardView from "./BoardView";
import Waiter from "./Waiter";

import useSession, { SessionProvider } from "../hooks/useSession";

// Keep compatibility with previous availableItems shape
const migrateAvailableItemList = (old) => {
  const groupMap = old.reduce((acc, { groupId, ...item }) => {
    if (!acc[groupId]) {
      acc[groupId] = [];
    }
    acc[groupId].push(item);
    return acc;
  }, {});
  return Object.keys(groupMap).map((name) => ({
    name,
    items: groupMap[name],
  }));
};

const adaptItem = (item) => ({
  type: item.type,
  template: item,
  component: itemTemplates[item.type].component,
  name: item.name || item.label || item.text || itemTemplates[item.type].name,
  uid: nanoid(),
});

const adaptAvailableItems = (nodes) => {
  return nodes.map((node) => {
    if (node.type) {
      return adaptItem(node);
    } else {
      return { ...node, items: adaptAvailableItems(node.items) };
    }
  });
};

export const Session = () => {
  const {
    loadSession,
    setSession,
    sessionLoaded,
    gameId,
    sessionId,
    availableItems,
  } = useSession();

  const gameLoadingRef = React.useRef(false);

  const { c2c, isMaster } = useC2C("board");

  const { t } = useTranslation();

  useAsyncEffect(
    async (isMounted) => {
      if (isMaster && !sessionLoaded && !gameLoadingRef.current) {
        gameLoadingRef.current = true;
        const sessionData = await loadSession();

        if (!isMounted) return;
        setSession(sessionData, true);
      }
    },
    [sessionLoaded, isMaster]
  );

  // Load game from master if any
  React.useEffect(() => {
    if (!isMaster && !sessionLoaded && !gameLoadingRef.current) {
      gameLoadingRef.current = true;
      const onReceiveGame = (receivedSession) => {
        console.log("game received", receivedSession);
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

  const availableItemLibrary = React.useMemo(() => {
    let itemList = availableItems;
    if (itemList.length && itemList[0].groupId) {
      itemList = migrateAvailableItemList(itemList);
    }
    return adaptAvailableItems(itemList);
  }, [availableItems]);

  const itemLibraries = [
    {
      name: "Standard",
      key: "standard",
      items: itemLibrary,
    },
    {
      name: "Box",
      key: "box",
      items: availableItemLibrary,
    },
  ];

  const mediaLibraries = React.useMemo(() => {
    if (gameId) {
      return [
        {
          id: "session",
          name: t("Session"),
          boxId: "session",
          resourceId: sessionId,
        },
        { id: "game", name: t("Game"), boxId: "game", resourceId: gameId },
      ];
    }
    return [
      {
        id: "session",
        name: t("Session"),
        boxId: "session",
        resourceId: sessionId,
      },
    ];
  }, [gameId, sessionId, t]);

  if (!sessionLoaded) {
    return <Waiter message={t("Session loading...")} />;
  }

  return (
    <BoardView mediaLibraries={mediaLibraries} itemLibraries={itemLibraries} />
  );
};

const ConnectedSessionView = ({ sessionId, fromGame }) => {
  return (
    <BoardWrapper
      room={`room_${sessionId}`}
      session={sessionId}
      itemTemplates={itemTemplates}
      actions={actionMap}
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <SessionProvider sessionId={sessionId} fromGameId={fromGame}>
        <Session />
      </SessionProvider>
    </BoardWrapper>
  );
};

export default ConnectedSessionView;
