import React from 'react';
import { useC2C } from '../hooks/useC2C';
import { PanZoomRotateState } from '../components/PanZoomRotate';
import { useRecoilValue } from 'recoil';
import { selectedItemsAtom } from './Selector';
import { userAtom } from '../hooks/useUser';

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

const Round = ({
  radius,
  color,
  text = '',
  textColor = '#000',
  fontSize = '16',
}) => {
  return (
    <div
      style={{
        borderRadius: '100%',
        width: radius,
        height: radius,
        backgroundColor: color,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          textColor,
          fontSize: fontSize + 'px',
        }}
      >
        {text}
      </span>
    </div>
  );
};

const Counter = ({
  value = 0,
  color = '#CCC',
  label = '',
  textColor = '#000',
  fontSize = '16',
  updateState,
}) => {
  const setValue = (e) => {
    updateState((prevState) => ({
      ...prevState,
      value: e.target.value,
    }));
  };

  const increment = (e) => {
    updateState((prevState) => ({
      ...prevState,
      value: prevState.value + 1,
    }));
  };

  const decrement = (e) => {
    updateState((prevState) => ({
      ...prevState,
      value: prevState.value - 1,
    }));
  };

  return (
    <div
      style={{
        backgroundColor: color,
        width: '5em',
        padding: '0.5em',
        paddingBottom: '2em',
        textAlign: 'center',
        fontSize: fontSize + 'px',
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'column',
        borderRadius: '0.5em',
        boxShadow: '10px 10px 13px 0px rgb(0, 0, 0, 0.3)',
      }}
    >
      <label style={{ userSelect: 'none' }}>
        {label}
        <input
          style={{
            textColor,
            width: '100%',
            display: 'block',
            textAlign: 'center',
            border: 'none',
            margin: '0.2em 0',
            padding: '0.2em 0',
            fontSize: fontSize + 'px',
            userSelect: 'none',
          }}
          value={value}
          onChange={setValue}
        />
      </label>
      <span
        style={{
          paddingTop: '1em',
        }}
      >
        <button onClick={increment} style={{ fontSize: fontSize + 'px' }}>
          +
        </button>
        <button onClick={decrement} style={{ fontSize: fontSize + 'px' }}>
          -
        </button>
      </span>
    </div>
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
  unflippedFor,
  extraStyling,
  imgText,
  backImgText,
}) => {
  const user = useRecoilValue(userAtom);
  const size = {};
  if (width) {
    size.width = width;
  }
  if (height) {
    size.height = height;
  }

  const onDblClick = React.useCallback(
    (e) => {
      if (e.ctrlKey) {
        updateState((prevItem) => {
          if (prevItem.unflippedFor !== null) {
            return { ...prevItem, unflippedFor: null };
          } else {
            return { ...prevItem, unflippedFor: user.id, flipped: false };
          }
        });
      } else {
        updateState((prevItem) => ({
          ...prevItem,
          flipped: !prevItem.flipped,
          unflippedFor: null,
        }));
      }
    },
    [updateState, user.id]
  );

  let image;
  if (backContent && (flipped || (unflippedFor && unflippedFor !== user.id))) {
    image = (
      <>
        {imgText && (
          <div
            className='image-text'
            style={{
              position: 'absolute',
              right: 0,
              padding: '0 3px',
              margin: '7px',
              'background-color': 'white',
              color: 'black',
              'border-radius': '50%',
            }}
          >
            {backImgText}
          </div>
        )}
        <img
          src={backContent}
          draggable={false}
          {...size}
          style={{ userSelect: 'none', pointerEvents: 'none', ...extraStyling }}
        />
      </>
    );
  } else {
    image = (
      <div className='image-wrapper' style={{ position: 'relative' }}>
        {unflippedFor && (
          <div
            style={{
              position: 'absolute',
              top: '-18px',
              left: '4px',
              color: '#555',
              backgroundColor: '#CCCCCCA0',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            Only you
          </div>
        )}
        {imgText && (
          <div
            class='image-text'
            style={{
              position: 'absolute',
              right: 0,
              padding: '0 3px',
              margin: '7px',
              'background-color': 'white',
              color: 'black',
              'border-radius': '50%',
            }}
          >
            {imgText}
          </div>
        )}
        <img
          src={content}
          draggable={false}
          {...size}
          style={{ userSelect: 'none', pointerEvents: 'none', ...extraStyling }}
        />
      </div>
    );
  }

  return <div onDoubleClick={onDblClick}>{image}</div>;
};

const getComponent = (type) => {
  switch (type) {
    case 'rect':
      return Rect;
    case 'round':
      return Round;
    case 'image':
      return Image;
    case 'counter':
      return Counter;
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
    (callbackOrItem, sync = true) => {
      setState(state.id, callbackOrItem, sync);
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
            updateState(
              (prevState) => ({
                ...prevState,
                actualWidth: width,
                actualHeight: height,
              }),
              false // Don't need to sync that.
            );
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
        setState(
          state.id,
          (prevState) => ({
            ...newItemState,
            // Ignore some modifications
            actualWidth: prevState.actualWidth,
            actualHeight: prevState.actualHeight,
          }),
          false
        );
      }
    );
    return unsub;
  }, [c2c, setState, state]);

  return <Item state={state} setState={setState} />;
};

export default SyncedItem;
