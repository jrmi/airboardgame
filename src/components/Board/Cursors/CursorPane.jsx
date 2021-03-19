import React from "react";
import Cursors from "./Cursors";
import { useC2C } from "../../../hooks/useC2C";
import { PanZoomRotateAtom } from "../";
import { useRecoilValue } from "recoil";

export const Board = ({ children, user, users }) => {
  const { c2c } = useC2C();
  const panZoomRotate = useRecoilValue(PanZoomRotateAtom);

  const publish = React.useCallback(
    (newPos) => {
      c2c.publish("cursorMove", {
        userId: user.id,
        pos: newPos,
      });
    },
    [c2c, user.id]
  );

  const onMouseMove = (e) => {
    const { top, left } = e.currentTarget.getBoundingClientRect();
    publish({
      x: (e.clientX - left) / panZoomRotate.scale,
      y: (e.clientY - top) / panZoomRotate.scale,
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
