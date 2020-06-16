import React from 'react';

import { useC2C } from '../hooks/useC2C';
import { nanoid } from 'nanoid';

import { ItemListAtom } from '../components/Items';
import { useRecoilValue } from 'recoil';

import useLocalStorage from 'react-use-localstorage';
import throttle from 'lodash.throttle';

import tiktok from '../games/tiktok';
import card from '../games/card';
import gloomhaven from '../games/gloomhaven';
import settlers from '../games/settlers';

const generateDownloadURI = (data) => {
  return (
    'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data))
  );
};

const formatDate = (date) => {
  console.log(date);
  return `${date.getFullYear()}${date.getMonth()}${date.getDay()}_${date.getHours()}${date.getMinutes()}`;
};

export const GameController = ({
  itemList,
  setItemList,
  boardConfig,
  setBoardConfig,
}) => {
  const [c2c, joined, isMaster] = useC2C();
  const [downloadURI, setDownloadURI] = React.useState({});
  const [date, setDate] = React.useState(Date.now());
  /*const [gameSave, setGameSave] = useLocalStorage('savedGame', {
    items: [],
    board: {},
  });*/

  const gameRef = React.useRef({ items: itemList, board: boardConfig });
  // Not very efficient way to do it
  const allItems = useRecoilValue(ItemListAtom);
  //gameRef.current = { items: [...allItems], board: boardConfig };
  gameRef.current = {
    items: JSON.parse(JSON.stringify(allItems)),
    board: boardConfig,
  };

  // Load game from master if any
  React.useEffect(() => {
    if (joined) {
      if (!isMaster) {
        c2c.call('getGame').then(
          (game) => {
            console.log('get this item list', game);
            setItemList(game.items);
            setBoardConfig(game.board);
          },
          () => {}
        );
      }
    }
  }, [c2c, isMaster, joined, setItemList, setBoardConfig]);

  React.useEffect(() => {
    const unsub = [];
    if (joined) {
      if (isMaster) {
        c2c
          .register('getGame', () => {
            console.log('send this game', gameRef.current);
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
    c2c.subscribe('loadGame', (game) => {
      console.log('loadgame', game);
      //
      setItemList(game.items);
      setBoardConfig(game.board);
    });
  }, [c2c, setItemList, setBoardConfig]);

  const loadTikTok = React.useCallback(() => {
    tiktok.items = tiktok.items.map((item) => ({ ...item, id: nanoid() }));
    c2c.publish('loadGame', tiktok, true);
  }, [c2c]);

  const loadCard = () => {
    card.items = card.items.map((item) => ({ ...item, id: nanoid() }));
    c2c.publish('loadGame', card, true);
  };

  const loadGloomhaven = () => {
    gloomhaven.items = gloomhaven.items.map((item) => ({
      ...item,
      id: nanoid(),
    }));
    c2c.publish('loadGame', gloomhaven, true);
  };

  const loadSettlers = React.useCallback(() => {
    settlers.items = settlers.items.map((item) => ({
      ...item,
      id: nanoid(),
    }));
    c2c.publish('loadGame', settlers, true);
  }, [c2c]);

  React.useEffect(() => {
    if (isMaster) {
      //loadSettlers();
      loadTikTok();
    }
  }, [loadSettlers, loadTikTok, isMaster]);

  /*const loadLastGame = () => {
    gameSave.items = gameSave.items.map((item) => ({
      ...item,
      id: nanoid(),
    }));
    c2c.publish('loadGame', gameSave, true);
  };*/

  const updateSaveLink = React.useCallback(
    throttle(
      (items, board) => {
        console.log('alled');
        setDownloadURI(generateDownloadURI({ items, board }));
        setDate(Date.now());
      },
      5000,
      { trailing: true }
    ),
    []
  );

  React.useEffect(() => {
    updateSaveLink(itemList, boardConfig);
  }, [itemList, boardConfig, updateSaveLink]);

  if (!isMaster) {
    return null;
  }
  return (
    <div
      style={{
        position: 'fixed',
        left: '2px',
        bottom: '2px',
        display: 'block',
      }}
    >
      <button onClick={() => {}}>Load last game</button>
      <button onClick={loadTikTok}>TikTok</button>
      <button onClick={loadCard}>Card</button>
      <button onClick={loadGloomhaven}>Gloomhaven</button>
      <button onClick={loadSettlers}>Settlers of Catan</button>
      <a href={downloadURI} download={`save_${date}.json`}>
        Save
      </a>
    </div>
  );
};

export default GameController;
