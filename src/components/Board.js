import React from 'react';
import Cursors from '../components/Cursors';
import Items from './Items';
import { useC2C } from '../hooks/useC2C';
import { PanZoomRotateState } from '../components/PanZoomRotate';
import { useRecoilValue } from 'recoil';
import Selector from '../components/Selector';

export const Board = ({ user, users, config }) => {
  const [c2c, joined, isMaster] = useC2C();
  const panZoomRotate = useRecoilValue(PanZoomRotateState);

  const onMouseMove = (e) => {
    const { top, left } = e.currentTarget.getBoundingClientRect();
    c2c.publish('cursorMove', {
      userId: user.id,
      pos: {
        x: (e.clientX - left) / panZoomRotate.scale,
        y: (e.clientY - top) / panZoomRotate.scale,
      },
    });
  };

  const onLeave = (e) => {
    c2c.publish('cursorOff', {
      userId: user.id,
    });
  };

  if (!config.size) {
    return <p>Please select a game…</p>;
  }

  return (
    <Selector>
      <div
        onMouseMove={onMouseMove}
        onMouseLeave={onLeave}
        className='content'
        style={{
          background:
            'repeating-linear-gradient(45deg, #606dbc60, #606dbc60 10px, #46529860 10px, #46529860 20px)',
          width: `${config.size}px`,
          height: `${config.size}px`,
        }}
      >
        <Items />
        <Cursors users={users} />
      </div>
    </Selector>
  );
};

export default Board;
