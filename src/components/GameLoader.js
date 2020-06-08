import React from 'react';

import { useC2C } from '../hooks/useC2C';
import { nanoid } from 'nanoid';

import tiktok from '../games/tiktok';
import card from '../games/card';

export const GameLoader = ({ setItemList, setBoardConfig }) => {
  const [c2c, joined, isMaster] = useC2C();

  React.useEffect(() => {
    c2c.subscribe('loadGame', (game) => {
      //console.log('loadgame', game);
      setItemList(game.items);
      setBoardConfig(game.board);
    });
  }, [c2c, setItemList, setBoardConfig]);

  const loadTikTok = () => {
    tiktok.items = tiktok.items.map((item) => ({ ...item, id: nanoid() }));
    c2c.publish('loadGame', tiktok, true);
  };

  const loadCard = () => {
    card.items = card.items.map((item) => ({ ...item, id: nanoid() }));
    c2c.publish('loadGame', card, true);
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
    </div>
  );
};

export default GameLoader;
