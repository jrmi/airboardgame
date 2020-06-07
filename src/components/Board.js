import React from 'react';
import Cursors from '../components/Cursors';
import Item from '../components/Item';
import { useC2C } from '../hooks/useC2C';
import { PanZoomRotateState } from '../components/PanZoomRotate';
import { useRecoilValue } from 'recoil';

export const Board = ({ user, users, items }) => {
  const [c2c, joined, isMaster] = useC2C();
  const [background, setBackground] = React.useState('');
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

  const boardDimension = { width: 3000, height: 3000 };

  return (
    <div
      onMouseMove={onMouseMove}
      onMouseLeave={onLeave}
      className='content'
      style={{
        background:
          'repeating-linear-gradient(45deg, #606dbc, #606dbc 10px, #465298 10px, #465298 20px)',
        /*backgroundImage: `url(${background})`,
        backgroundSize: '50%',
        backgroundPosition: '50% 50%',
        backgroundRepeat: 'no-repeat',*/
        width: `${boardDimension.width}px`,
        height: `${boardDimension.height}px`,
      }}
    >
      {items.map((item) => (
        <Item key={item.id} {...item} />
      ))}
      <Cursors users={users} />
    </div>
  );
};

export default Board;
