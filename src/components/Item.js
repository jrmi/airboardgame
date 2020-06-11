import React from 'react';
import { DraggableCore } from 'react-draggable';
import { useC2C } from '../hooks/useC2C';
import { PanZoomRotateState } from '../components/PanZoomRotate';
import { useRecoilValue } from 'recoil';

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

const Item = ({ id, setState, state }) => {
  const [c2c] = useC2C();
  const itemStateRef = React.useRef({ ...state });
  itemStateRef.current = { ...state };

  const panZoomRotate = useRecoilValue(PanZoomRotateState);

  // Use this for each state update.
  const updateState = React.useCallback(
    (newState) => {
      itemStateRef.current = { ...itemStateRef.current, ...newState };
      setState({ ...itemStateRef.current });

      c2c.publish(`itemStateUpdate.${state.id}`, {
        ...itemStateRef.current,
      });
    },
    [c2c, setState, state]
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
      setState(newItemState);
    });
    return unsub;
  }, [id, c2c, setState]);

  const Component = getComponent(state.type);

  const content = (
    <div
      style={{
        position: 'absolute',
        left: state.x,
        top: state.y,
        //border: '2px dashed #000000A0',
        display: 'inline-block',
        boxSizing: 'content-box',
        padding: '2px',
      }}
      className='item'
    >
      <Component {...state} updateState={updateState} />
    </div>
  );

  if (!state.locked) {
    return <DraggableCore onDrag={onDrag}>{content}</DraggableCore>;
  }

  return (
    <div style={{ pointerEvents: 'none', userSelect: 'none' }}>{content}</div>
  );
};

export default Item;
