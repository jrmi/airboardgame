import React from 'react';

import { useC2C } from '../hooks/useC2C';
import { nanoid } from 'nanoid';

import { ItemListAtom } from '../components/Items';
import { useRecoilValue } from 'recoil';

import tiktok from '../games/tiktok';
import card from '../games/card';
import gloomhaven from '../games/gloomhaven';

export const GameLoader = ({
  itemList,
  setItemList,
  boardConfig,
  setBoardConfig,
}) => {
  const [c2c, joined, isMaster] = useC2C();
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
        c2c.call('getGame').then((game) => {
          console.log('get this item list', game);
          setItemList(game.items);
          setBoardConfig(game.board);
        });
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

  React.useEffect(() => {
    if (isMaster) {
      card.items = card.items.map((item) => ({ ...item, id: nanoid() }));
      c2c.publish('loadGame', card, true);
    }
  }, [c2c, isMaster]);

  const loadTikTok = () => {
    tiktok.items = tiktok.items.map((item) => ({ ...item, id: nanoid() }));
    c2c.publish('loadGame', tiktok, true);
  };

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
      <button onClick={loadTikTok}>TikTok</button>
      <button onClick={loadCard}>Card</button>
      <button onClick={loadGloomhaven}>Gloomhaven</button>
    </div>
  );
};

export default GameLoader;
