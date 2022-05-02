import React from "react";
import { useTranslation } from "react-i18next";
import useAsyncEffect from "use-async-effect";
import { BoardWrapper, useWire } from "react-sync-board";
import { useSocket } from "@scripters/use-socket.io";

import { itemTemplates, itemLibrary, premadeItems } from "../gameComponents";

import BoardView from "./BoardView";
import SessionRestoreDim from "./SessionRestoreDim";
import Waiter from "../ui/Waiter";
import { uid } from "../utils";
import { GlobalConfProvider } from "../hooks/useGlobalConf";

import useSession, { SessionProvider } from "../hooks/useSession";
import AutoSaveSession from "./AutoSaveSession";

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
  uid: uid(),
});

const adaptItems = (nodes) => {
  return nodes.map((node) => {
    if (node.type) {
      return adaptItem(node);
    } else {
      return { ...node, items: adaptItems(node.items) };
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

  const { wire, isMaster } = useWire("board");

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
        setSession(receivedSession);
      };
      wire.call("getSession").then(onReceiveGame, () => {
        setTimeout(
          () =>
            wire
              .call("getSession")
              .then(onReceiveGame, (error) =>
                console.log("Failed to call getSession with error", error)
              ),
          1000
        );
      });
    }
  }, [wire, isMaster, sessionLoaded, setSession]);

  const itemLibraries = React.useMemo(() => {
    let itemList = availableItems;
    if (itemList.length && itemList[0].groupId) {
      itemList = migrateAvailableItemList(itemList);
    }
    const availableItemLibrary = adaptItems(itemList);
    const premadeLibrary = adaptItems(premadeItems);

    const libraries = [
      {
        name: t("Standard"),
        key: "standard",
        items: itemLibrary,
      },
      {
        name: t("Premade"),
        key: "premade",
        items: premadeLibrary,
      },
    ];

    if (availableItems.length) {
      libraries.push({
        name: t("Box"),
        key: "box",
        items: availableItemLibrary,
      });
    }
    return libraries;
  }, [availableItems, t]);

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
    <>
      <GlobalConfProvider>
        <BoardView
          mediaLibraries={mediaLibraries}
          itemLibraries={itemLibraries}
        />
      </GlobalConfProvider>
      <SessionRestoreDim />
      {isMaster && <AutoSaveSession />}
    </>
  );
};

const ConnectedSessionView = ({ sessionId, fromGame }) => {
  const socket = useSocket();
  return (
    <BoardWrapper
      room={`room_${sessionId}`}
      session={sessionId}
      style={{
        position: "fixed",
        inset: "0",
        overflow: "hidden",
      }}
      socket={socket}
    >
      <SessionProvider sessionId={sessionId} fromGameId={fromGame}>
        <Session />
      </SessionProvider>
    </BoardWrapper>
  );
};

export default ConnectedSessionView;
