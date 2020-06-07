import React from 'react';
import memoize from 'memoizee';
import { useRecoilState, atom } from 'recoil';
import { DraggableCore } from 'react-draggable';
import { useC2C } from '../hooks/useC2C';
import { PanZoomRotateState } from '../components/PanZoomRotate';
import { useRecoilValue } from 'recoil';

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
  const panZoomRotate = useRecoilValue(PanZoomRotateState);

  React.useState(() => {
    setItemState(props);
  }, [props]);

  const onDrag = (e, data) => {
    const { deltaX, deltaY } = data;

    c2c.publish(
      `itemStateUpdate.${id}`,
      {
        ...itemStateRef.current,
        x: itemStateRef.current.x + deltaX / panZoomRotate.scale,
        y: itemStateRef.current.y + deltaY / panZoomRotate.scale,
      },
      true
    );
    //e.stopPropagation();
  };

  React.useEffect(() => {
    const unsub = c2c.subscribe(`itemStateUpdate.${id}`, (newItemState) => {
      setItemState(newItemState);
    });
    return unsub;
  }, [id, c2c, setItemState]);

  const onClick = (e) => {
    //e.stopPropagation();
  };

  return (
    <DraggableCore onDrag={onDrag} onPanningStart={onClick}>
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
