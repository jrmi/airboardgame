import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { useC2C } from "../hooks/useC2C";
import { nanoid } from "nanoid";

import { ItemListAtom } from "../components/Items";
import { useRecoilValue } from "recoil";

import useLocalStorage from "../hooks/useLocalStorage";
//import useLocalStorage from 'react-use-localstorage';

import throttle from "lodash.throttle";

import tiktok from "../games/tiktok";
import card from "../games/card";
import gloomhaven from "../games/gloomhaven";
import gloomhavenBox from "../games/gloomhaven-box";
import settlers from "../games/settlers";
import LoadGame from "./LoadGame";
import AvailableItems from "./AvailableItems";

const generateDownloadURI = (data) => {
  return (
    "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data))
  );
};

const RightPane = styled.div`
  position: fixed;
  left: 0.5em;
  top: 0.5em;
  bottom: 0.5em;
  background-color: #ffffff77;
  display: flex;
  flex-direction: column;
  width: 15em;
  padding: 0.5em;
  text-align: center;
  overflow-y: scroll;
`;

const AvailableItemList = styled.div`
  margin-top: 2em;
  background-color: black;
  color: white;
  list-type: none;
`;

const Title = styled.h3``;

export const GameController = ({
  itemList,
  setItemList,
  availableItemList,
  setAvailableItemList,
  boardConfig,
  setBoardConfig,
}) => {
  const { t } = useTranslation();
  const [c2c, joined, isMaster] = useC2C();
  const [downloadURI, setDownloadURI] = React.useState({});
  const [date, setDate] = React.useState(Date.now());
  const [gameLocalSave, setGameLocalSave] = useLocalStorage("savedGame", {
    items: itemList,
    board: boardConfig,
    availableItems: availableItemList,
  });

  const gameRef = React.useRef({
    items: itemList,
    board: boardConfig,
    availableItems: availableItemList,
  });
  const allItems = useRecoilValue(ItemListAtom);
  gameRef.current = {
    items: JSON.parse(JSON.stringify(allItems)),
    board: boardConfig,
    availableItem: availableItemList,
  };

  // Load game from master if any
  React.useEffect(() => {
    if (joined) {
      if (!isMaster) {
        c2c.call("getGame").then(
          (game) => {
            console.log("Get this game from master", game);
            setAvailableItemList(game.availableItems);
            setItemList(game.items);
            setBoardConfig(game.board);
          },
          () => {}
        );
      }
    }
  }, [
    c2c,
    isMaster,
    joined,
    setAvailableItemList,
    setItemList,
    setBoardConfig,
  ]);

  React.useEffect(() => {
    const unsub = [];
    if (joined) {
      if (isMaster) {
        c2c
          .register("getGame", () => {
            console.log("Send this game", gameRef.current);
            return gameRef.current;
          })
          .then((unregister) => {
            unsub.push(unregister);
          });
      }
    }
    return () => {
      unsub.forEach((u) => u());
    };
  }, [c2c, isMaster, joined]);

  React.useEffect(() => {
    c2c.subscribe("loadGame", (game) => {
      console.log("Loadgame", game);
      //
      setAvailableItemList(game.availableItems);
      setItemList(game.items);
      setBoardConfig(game.board);
    });
  }, [c2c, setAvailableItemList, setItemList, setBoardConfig]);

  const loadTikTok = React.useCallback(() => {
    tiktok.availableItems = [];
    tiktok.items = tiktok.items.map((item) => ({ ...item, id: nanoid() }));
    c2c.publish("loadGame", tiktok, true);
  }, [c2c]);

  const loadCard = () => {
    card.availableItems = [];
    card.items = card.items.map((item) => ({ ...item, id: nanoid() }));
    c2c.publish("loadGame", card, true);
  };

  const loadGloomhaven = () => {
    gloomhaven.availableItems = gloomhavenBox.items;
    gloomhaven.items = gloomhaven.items.map((item) => ({
      ...item,
      id: nanoid(),
    }));
    c2c.publish("loadGame", gloomhaven, true);
  };

  const loadSettlers = React.useCallback(() => {
    settlers.availableItems = [];
    settlers.items = settlers.items.map((item) => ({
      ...item,
      id: nanoid(),
    }));
    c2c.publish("loadGame", settlers, true);
  }, [c2c]);

  const onLoadSavedGame = React.useCallback(
    (game) => {
      game.items = game.items.map((item) => ({
        ...item,
        id: nanoid(),
      }));
      c2c.publish("loadGame", game, true);
    },
    [c2c]
  );

  const loadLocalSavedGame = React.useCallback(() => {
    const game = { ...gameLocalSave };
    game.items = game.items.map((item) => ({
      ...item,
      id: nanoid(),
    }));

    c2c.publish("loadGame", game, true);
  }, [c2c, gameLocalSave]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateSaveLink = React.useCallback(
    throttle(
      (game) => {
        if (game.items.length) {
          setDownloadURI(generateDownloadURI(game));
          setDate(Date.now());
          setGameLocalSave(game);
        }
      },
      5000,
      { trailing: true }
    ),
    []
  );

  /*React.useEffect(() => {
    if (isMaster) {
      console.log('should load');
      loadLocalSavedGame();
    }
  }, [isMaster]);*/

  React.useEffect(() => {
    updateSaveLink({
      items: itemList,
      board: boardConfig,
      availableItems: availableItemList,
    });
  }, [itemList, boardConfig, availableItemList, updateSaveLink]);

  if (!isMaster) {
    return null;
  }

  return (
    <RightPane>
      <Title>{t("Games")}</Title>
      <button onClick={loadTikTok}>TikTok</button>
      <button onClick={loadCard}>Card</button>
      <button onClick={loadGloomhaven}>Gloomhaven</button>
      <button onClick={loadSettlers}>Settlers of Catan</button>
      <Title>{t("Save/Load")}</Title>
      <button onClick={loadLocalSavedGame}>{t("Load last game")}</button>
      <LoadGame onLoad={onLoadSavedGame} />
      <a href={downloadURI} download={`save_${date}.json`}>
        {t("Save game")}
      </a>
      {availableItemList && availableItemList.length > 0 && (
        <AvailableItemList>
          <Title>{t("Box Content")}</Title>
          <AvailableItems />
        </AvailableItemList>
      )}
    </RightPane>
  );
};

export default GameController;
