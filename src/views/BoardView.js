import React from 'react';
import Rect from '../components/Rect';
import Cursors from '../components/Cursors';
import Users from '../components/Users';
import Item from '../components/Item';
import { useC2C } from '../hooks/useC2C';
import useUser from '../hooks/useUser';
import useUsers from '../hooks/useUsers';

import tiktok from '../utils/tiktok';
import { nanoid } from 'nanoid';
import ZoomPanRotate from '../components/PanZoomRotate';
import Board from '../components/Board';

export const BoardView = ({ room }) => {
  const users = useUsers();
  const [user, setUser] = useUser();
  const [c2c, joined, isMaster] = useC2C();
  const [itemList, setItemList] = React.useState([]);
  const [boardConfig, setBoardConfig] = React.useState({});

  React.useEffect(() => {
    c2c.subscribe('loadGame', (game) => {
      console.log('loadgame', game);
      setItemList(game.items);
      setBoardConfig(game.board);
    });
  }, [c2c]);

  const loadGame = () => {
    tiktok.items = tiktok.items.map((item) => ({ ...item, id: nanoid() }));
    c2c.publish('loadGame', tiktok, true);
  };

  return (
    <div className='board'>
      <ZoomPanRotate>
        <Board
          user={user}
          users={users}
          items={itemList}
          config={boardConfig}
        />
      </ZoomPanRotate>

      <Users users={users} userId={user.id} />
      {isMaster && (
        <button
          style={{
            position: 'fixed',
            left: '2px',
            bottom: '2px',
            display: 'block',
          }}
          onClick={loadGame}
        >
          Start
        </button>
      )}
    </div>
  );
};

export default BoardView;
