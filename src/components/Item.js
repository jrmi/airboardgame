import React from 'react';
import memoize from 'memoizee';
import { useRecoilState, atom, selector } from 'recoil';
import { DraggableCore } from 'react-draggable';
import { useC2C } from '../hooks/useC2C';
import { PanZoomRotateState } from '../components/PanZoomRotate';
import { useRecoilValue } from 'recoil';

const Items = atom({
  key: 'items',
  default: [],
});

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

// TODO yeark
export const AllItems = selector({
  key: 'allItems',
  get: ({ get }) => {
    const items = get(Items);
    return items.map((id) => ({ ...get(ItemWithId(id)), id }));
  },
});

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
const Image = ({
  width,
  height,
  content,
  backContent,
  flipped,
  updateState,
}) => {
  const size = {};
  if (width) {
    size.width = width;
  }
  if (height) {
    size.height = height;
  }

  const onDblClick = (e) => {
    updateState({ flipped: !flipped });
  };

  if (flipped && backContent) {
    return (
      <img
        src={backContent}
        draggable={false}
        {...size}
        onDoubleClick={onDblClick}
      />
    );
  }
  return (
    <img src={content} draggable={false} {...size} onDoubleClick={onDblClick} />
  );
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
  const [items, setItems] = useRecoilState(Items);
  const [itemState, setItemState] = useRecoilState(ItemWithId(id));
  const [c2c, _] = useC2C();
  const itemStateRef = React.useRef({ ...itemState });
  itemStateRef.current = { ...itemState };

  const panZoomRotate = useRecoilValue(PanZoomRotateState);

  React.useState(() => {
    setItems((prevItems) => [...new Set([...prevItems, id])]);
    return () => {
      setItems((prevItems) => prevItems.filter((itemId) => id === itemId));
    };
  }, [id]);

  React.useState(() => {
    setItemState(props);
  }, [props]);

  // Use this for each state update.
  const updateState = React.useCallback(
    (newState) => {
      itemStateRef.current = { ...itemStateRef.current, ...newState };
      setItemState({ ...itemStateRef.current });

      c2c.publish(`itemStateUpdate.${id}`, {
        ...itemStateRef.current,
      });
    },
    [c2c, id, setItemState]
  );

  const onDrag = (e, data) => {
    const { deltaX, deltaY } = data;
    updateState({
      x: itemStateRef.current.x + deltaX / panZoomRotate.scale,
      y: itemStateRef.current.y + deltaY / panZoomRotate.scale,
    });
  };

  /*React.useEffect(() => {
    c2c.publish(`itemStateUpdate.${id}`, {
      ...itemState,
    });
  }, [c2c, id, itemState]);*/

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
      <Component {...itemState} updateState={updateState} />
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
