import React from 'react';
import memoize from 'memoizee';
import { useRecoilState, atom } from 'recoil';
import Draggable, { DraggableCore } from 'react-draggable';
import { useC2C } from '../hooks/useC2C';

export const ItemWithId = memoize((id) =>
  atom({
    key: `item${id}`,
    default: {
      color: '#00D022',
      width: 30,
      height: 30,
      x: 10,
      y: 10,
    },
  })
);

const Item = ({ id, ...props }) => {
  const [itemState, setItemState] = useRecoilState(ItemWithId(id));
  const [c2c, _] = useC2C();
  const itemStateRef = React.useRef(itemState);
  itemStateRef.current = itemState;

  const onDrag = (_, data) => {
    const { deltaX, deltaY } = data;

    c2c.publish(
      `itemStateUpdate.${id}`,
      {
        ...itemStateRef.current,
        x: itemStateRef.current.x + deltaX,
        y: itemStateRef.current.y + deltaY,
      },
      true
    );
  };

  React.useEffect(() => {
    const unsub = c2c.subscribe(`itemStateUpdate.${id}`, (newItemState) => {
      setItemState(newItemState);
    });
    return unsub;
  }, [id, c2c, setItemState]);

  return (
    <DraggableCore onDrag={onDrag}>
      <div
        style={{
          position: 'absolute',
          left: itemState.x,
          top: itemState.y,
          width: itemState.width,
          height: itemState.height,
          backgroundColor: itemState.color,
        }}
        {...props}
      />
    </DraggableCore>
  );
};

export default Item;
