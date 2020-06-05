import React from 'react';
import './App.css';
import { emitMouseMove, init } from './socket-client';

function withUsers() {
  const [size, setSize] = React.useState({ width: 20, height: 50 });
  const [cursorPos, setCursorPos] = React.useState({ x: 0, y: 0 });

  const onMouseMove = (e) => {
    emitMouseMove({ x: e.clientX, y: e.clientY });
  };

  React.useEffect(() => {
    const onCursorMove = ({ user, newPos }) => {
      setCursorPos(newPos);
    };
    init({ onCursorMove });
  }, []);

  return null;
}

export default User;
