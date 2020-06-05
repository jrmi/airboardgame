import React from 'react';
import Rect from '../components/Rect';
import Cursors from '../components/Cursors';
import Users from '../components/Users';
import Item from '../components/Item';
import { useC2C } from '../hooks/useC2C';
import useUser from '../hooks/useUser';
import useUsers from '../hooks/useUsers';

import tiktok from '../utils/tiktok';

const elements = [
  {
    id: 'a',
  },
  {
    id: 'b',
  },
];

export const Board = ({ room }) => {
  const users = useUsers();
  const [user, setUser] = useUser();
  const [c2c, joined, isMaster] = useC2C();

  const onMouseMove = (e) => {
    //const { top, left } = e.currentTarget.getBoundingClientRect();
    c2c.publish('cursorMove', {
      userId: user.id,
      pos: { x: e.pageX, y: e.pageY },
    });
  };

  const onLeave = (e) => {
    c2c.publish('cursorOff', {
      userId: user.id,
    });
  };

  React.useEffect(() => {
    c2c.subscribe('loadGame', (game) => {
      console.log('loadgame', game);
    });
  }, [c2c]);

  React.useEffect(() => {
    c2c.publish('loadGame', tiktok);
  }, [c2c]);

  const loadGame = () => {
    c2c.publish('loadGame', tiktok);
  };

  return (
    <div className='board' onMouseMove={onMouseMove} onMouseLeave={onLeave}>
      <div className='content'>
        {elements.map(({ id }) => (
          <Item key={id} id={id} />
        ))}
        <Users users={users} userId={user.id} />
        <Cursors users={users} />
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
    </div>
  );
};

export default Board;
