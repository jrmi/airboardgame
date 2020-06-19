import React from "react";
import Cursors from "../components/Cursors";
import { useC2C } from "../hooks/useC2C";
import { PanZoomRotateState } from "../components/PanZoomRotate";
import { useRecoilValue } from "recoil";

export const Board = ({ children, user, users }) => {
  const [c2c] = useC2C();
  const panZoomRotate = useRecoilValue(PanZoomRotateState);

  const onMouseMove = (e) => {
    const { top, left } = e.currentTarget.getBoundingClientRect();
    c2c.publish("cursorMove", {
      userId: user.id,
      pos: {
        x: (e.clientX - left) / panZoomRotate.scale,
        y: (e.clientY - top) / panZoomRotate.scale,
      },
    });
  };

  const onLeave = () => {
    c2c.publish("cursorOff", {
      userId: user.id,
    });
  };

  return (
    <div onMouseMove={onMouseMove} onMouseLeave={onLeave}>
      {children}
      <Cursors users={users} />
    </div>
  );
};

export default Board;
