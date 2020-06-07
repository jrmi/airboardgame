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

const Rect = ({ width, height, color }) => {
  return (
    <div
      style={{
        width: width,
        height: height,
        backgroundColor: color,
      }}
    />
  );
};

const Round = ({ radius, color }) => {
  return (
    <div
      style={{
        borderRadius: '100%',
        width: radius,
        height: radius,
        backgroundColor: color,
      }}
    />
  );
};

// See https://stackoverflow.com/questions/3680429/click-through-div-to-underlying-elements
// https://developer.mozilla.org/fr/docs/Web/CSS/pointer-events
const Image = ({ width, height, content }) => {
  const size = {};
  if (width) {
    size.width = width;
  }
  if (height) {
    size.height = height;
  }
  return <img src={content} draggable={false} {...size} />;
};

const getComponent = (type) => {
  switch (type) {
    case 'rect':
      return Rect;
    case 'round':
      return Round;
    case 'image':
      return Image;
    default:
      return Rect;
  }
};

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
  };

  React.useEffect(() => {
    const unsub = c2c.subscribe(`itemStateUpdate.${id}`, (newItemState) => {
      setItemState(newItemState);
    });
    return unsub;
  }, [id, c2c, setItemState]);

  const Component = getComponent(itemState.type);

  const content = (
    <div
      style={{
        position: 'absolute',
        left: itemState.x,
        top: itemState.y,
        //border: '2px dashed #000000A0',
        display: 'inline-block',
        boxSizing: 'content-box',
        padding: '2px',
      }}
    >
      <Component {...itemState} />
    </div>
  );

  if (!itemState.locked) {
    return <DraggableCore onDrag={onDrag}>{content}</DraggableCore>;
  }

  return (
    <div style={{ pointerEvents: 'none', userSelect: 'none' }}>{content}</div>
  );
};

export default Item;
