import React from "react";
import { useTranslation } from "react-i18next";
import useAsyncEffect from "use-async-effect";
import { BoardWrapper, useC2C } from "react-sync-board";
import { nanoid } from "nanoid";

import { itemTemplates, itemLibrary, actionMap } from "../gameComponents";

import BoardView from "./BoardView";
import Waiter from "./Waiter";
import { getGame } from "../utils/api";

import useGame, { GameProvider } from "../hooks/useGame";

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

export const GameView = () => {
  const { setGame, gameLoaded, gameId, availableItems } = useGame();

  const gameLoadingRef = React.useRef(false);

  const { t } = useTranslation();

  useAsyncEffect(
    async (isMounted) => {
      if (!gameLoaded && !gameLoadingRef.current) {
        gameLoadingRef.current = true;
        const gameData = await getGame(gameId);

        if (!isMounted) return;
        setGame(gameData);
      }
    },
    [gameLoaded]
  );

  const availableItemLibrary = React.useMemo(() => {
    let itemList = availableItems;
    if (itemList?.length && itemList[0].groupId) {
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
    return [{ id: "game", name: t("Game"), boxId: "game", resourceId: gameId }];
  }, [gameId, t]);

  if (!gameLoaded) {
    return <Waiter message={t("Session loading...")} />;
  }

  return (
    <BoardView
      mediaLibraries={mediaLibraries}
      itemLibraries={itemLibraries}
      edit={true}
    />
  );
};

const ConnectedGameView = ({ gameId }) => {
  const [sessionId] = React.useState(nanoid());

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
      <GameProvider gameId={gameId}>
        <GameView />
      </GameProvider>
    </BoardWrapper>
  );
};

export default ConnectedGameView;
