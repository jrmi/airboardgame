import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { useC2C } from "../hooks/useC2C";
import { nanoid } from "nanoid";

import useLocalStorage from "../hooks/useLocalStorage";
//import useLocalStorage from 'react-use-localstorage';

import throttle from "lodash.throttle";

import testGame from "../games/testGame";
import LoadGame from "./LoadGame";
import AvailableItems from "./AvailableItems";
import { useItems } from "../components/Board/Items";
import NewItems from "./NewItems";

const generateDownloadURI = (data) => {
  return (
    "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data))
  );
};

const LeftPane = styled.div`
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

const GAMELIST_URL = process.env.REACT_APP_GAMELIST_URL || "/gamelist.json";

const loadGameList = async () => {
  console.log(GAMELIST_URL);
  const result = await fetch(GAMELIST_URL);
  return await result.json();
};

const fetchGame = async (url) => {
  console.log(url);
  const result = await fetch(url);
  return await result.json();
};

export const GameController = ({ availableItemList, boardConfig }) => {
  const { t } = useTranslation();
  const [c2c, , isMaster] = useC2C();
  const { itemList } = useItems();
  const [gameList, setGameList] = React.useState([]);
  const [downloadURI, setDownloadURI] = React.useState({});
  const [date, setDate] = React.useState(Date.now());
  const [gameLocalSave, setGameLocalSave] = useLocalStorage("savedGame", {
    items: itemList,
    board: boardConfig,
    availableItems: availableItemList,
  });

  React.useEffect(() => {
    loadGameList().then((content) => {
      setGameList(content);
    });
  }, []);

  const loadGame = React.useCallback(
    (game) => {
      game.items = game.items.map((item) => ({ ...item, id: nanoid() }));
      c2c.publish("loadGame", game, true);
    },
    [c2c]
  );

  const loadGameUrl = React.useCallback(
    (url) => {
      fetchGame(url).then((content) => {
        loadGame(content);
      });
    },
    [loadGame]
  );

  const newGame = React.useCallback(() => {
    loadGame({
      items: [],
      availableItems: [],
      board: { size: 1000, scale: 0.5 },
    });
  }, [loadGame]);

  const loadTestGame = React.useCallback(() => {
    testGame.availableItems = [];
    loadGame(testGame);
  }, [loadGame]);

  const loadLocalSavedGame = React.useCallback(() => {
    loadGame({ ...gameLocalSave });
  }, [loadGame, gameLocalSave]);

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

  const logGame = () => {
    console.log(itemList);
  };

  if (!isMaster) {
    return null;
  }

  return (
    <LeftPane>
      <Title onClick={logGame}>{t("Games")}</Title>
      <button onClick={newGame}>New Game</button>
      <button onClick={loadTestGame}>Test Game</button>
      {gameList.map(({ name, url }) => (
        <button key={name} onClick={() => loadGameUrl(url)}>
          {name}
        </button>
      ))}
      <Title>{t("Save/Load")}</Title>
      <button onClick={loadLocalSavedGame}>{t("Load last game")}</button>
      <LoadGame onLoad={loadGame} />
      <a href={downloadURI} download={`save_${date}.json`}>
        {t("Save game")}
      </a>
      <Title>{t("Add item")}</Title>
      <NewItems />
      {availableItemList && availableItemList.length > 0 && (
        <AvailableItemList>
          <Title>{t("Box Content")}</Title>
          <AvailableItems />
        </AvailableItemList>
      )}
    </LeftPane>
  );
};

export default GameController;
