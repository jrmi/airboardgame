import React from 'react';
import { DraggableCore } from 'react-draggable';
import { useC2C } from '../hooks/useC2C';
import { PanZoomRotateState } from '../components/PanZoomRotate';
import { useRecoilValue } from 'recoil';
import { selectedItemsAtom } from './Selector';
import { nanoid } from 'nanoid';

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
      <div onDoubleClick={onDblClick}>
        <img
          src={backContent}
          draggable={false}
          {...size}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        />
      </div>
    );
  }
  return (
    <div onDoubleClick={onDblClick}>
      <img
        src={content}
        draggable={false}
        {...size}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
        onDoubleClick={onDblClick}
      />
    </div>
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

const Item = ({ setState, state }) => {
  const selectedItems = useRecoilValue(selectedItemsAtom);
  const itemRef = React.useRef(null);

  const Component = getComponent(state.type);

  const style = {};
  if (selectedItems.includes(state.id)) {
    style.border = '2px dashed #ff0000A0';
    style.padding = '2px';
  } else {
    style.padding = '4px';
  }

  const rotation = state.rotation || 0;

  const updateState = React.useCallback(
    (modif) => {
      setState({ ...state, ...modif });
    },
    [setState, state]
  );

  // Update actual size when update
  React.useEffect(() => {
    const currentElem = itemRef.current;
    const callback = (entries) => {
      entries.map((entry) => {
        if (entry.contentBoxSize) {
          const { inlineSize: width, blockSize: height } = entry.contentBoxSize;
          if (state.actualWidth !== width || state.actualHeight !== height) {
            setState({
              ...state,
              actualWidth: width,
              actualHeight: height,
            });
          }
        }
      });
    };
    const observer = new ResizeObserver(callback);
    observer.observe(currentElem);
    return () => {
      observer.unobserve(currentElem);
    };
  }, [setState, state]);

  const content = (
    <div
      style={{
        position: 'absolute',
        left: state.x,
        top: state.y,
        display: 'inline-block',
        boxSizing: 'content-box',
        transform: `rotate(${rotation}deg)`,
        ...style,
      }}
      className='item'
      ref={itemRef}
    >
      <Component {...state} updateState={updateState} />
    </div>
  );

  if (!state.locked) {
    return content;
  }

  return (
    <div
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {content}
    </div>
  );
};

const SyncedItem = ({ setState, state }) => {
  const [c2c] = useC2C();
  const versionsRef = React.useRef([]);

  React.useEffect(() => {
    if (versionsRef.current.includes(state.version)) {
      versionsRef.current = versionsRef.current.filter((v) => {
        return v !== state.version;
      });
    } else {
      c2c.publish(`itemStateUpdate.${state.id}`, {
        ...state,
      });
    }
  }, [c2c, setState, state]);

  React.useEffect(() => {
    const unsub = c2c.subscribe(
      `itemStateUpdate.${state.id}`,
      (newItemState) => {
        const nextVersion = nanoid();
        versionsRef.current.push(nextVersion);
        setState({ ...newItemState, version: nextVersion });
      }
    );
    return unsub;
  }, [c2c, setState, state]);

  return <Item state={state} setState={setState} />;
};

export default SyncedItem;
