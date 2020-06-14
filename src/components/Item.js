import React from 'react';
import { useC2C } from '../hooks/useC2C';
import { PanZoomRotateState } from '../components/PanZoomRotate';
import { useRecoilValue } from 'recoil';
import { selectedItemsAtom } from './Selector';

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
    updateState((prevItem) => ({ ...prevItem, flipped: !prevItem.flipped }));
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
  const [unlock, setUnlock] = React.useState(false);

  React.useEffect(() => {
    // Add id to element
    itemRef.current.id = state.id;
  }, [state]);

  // Allow to operate on locked item if ctrl is pressed
  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Control') {
        setUnlock(true);
      }
    };
    const onKeyUp = (e) => {
      if (e.key === 'Control') {
        setUnlock(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

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
    (callbackOrItem) => {
      setState(state.id, callbackOrItem);
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
            updateState((prevState) => ({
              ...prevState,
              actualWidth: width,
              actualHeight: height,
            }));
          }
        }
      });
    };
    const observer = new ResizeObserver(callback);
    observer.observe(currentElem);
    return () => {
      observer.unobserve(currentElem);
    };
  }, [updateState, state]);

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

  if (!state.locked || unlock) {
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

  React.useEffect(() => {
    const unsub = c2c.subscribe(
      `itemStateUpdate.${state.id}`,
      (newItemState) => {
        setState(state.id, newItemState, false);
      }
    );
    return unsub;
  }, [c2c, setState, state]);

  return <Item state={state} setState={setState} />;
};

export default SyncedItem;
