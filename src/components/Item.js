import React from "react";
import { useC2C } from "../hooks/useC2C";
import { useRecoilValue } from "recoil";
import { selectedItemsAtom } from "./Selector";
import { userAtom } from "../hooks/useUser";
import debounce from "lodash.debounce";
import styled, { css } from "styled-components";

const Rect = styled.div`
  ${({ width, height, color }) => css`
    width: ${width}px;
    height: ${height}px;
    background-color: ${color};
  `}
`;

const StyledRound = styled.div`
  ${({ radius, color }) => css`
    border-radius: 100%;
    width: ${radius}px;
    height: ${radius}px;
    background-color: ${color};
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  `}
`;

const Round = ({
  radius,
  color,
  text = "",
  textColor = "#000",
  fontSize = "16",
}) => {
  return (
    <StyledRound radius={radius} color={color}>
      <span
        style={{
          textColor,
          fontSize: fontSize + "px",
        }}
      >
        {text}
      </span>
    </StyledRound>
  );
};

const CounterPane = styled.div`
  ${({ color, fontSize }) => css`
    backgroundcolor: ${color};
    width: 5em;
    padding: 0.5em;
    paddingbottom: 2em;
    textalign: center;
    fontsize: ${fontSize}px;
    display: flex;
    justifycontent: space-between;
    flexdirection: column;
    borderradius: 0.5em;
    boxshadow: 10px 10px 13px 0px rgb(0, 0, 0, 0.3);
  `}
`;

const Counter = ({
  value = 0,
  color = "#CCC",
  label = "",
  textColor = "#000",
  fontSize = "16",
  updateState,
}) => {
  const setValue = (e) => {
    updateState((prevState) => ({
      ...prevState,
      value: e.target.value,
    }));
  };

  const increment = () => {
    updateState((prevState) => ({
      ...prevState,
      value: prevState.value + 1,
    }));
  };

  const decrement = () => {
    updateState((prevState) => ({
      ...prevState,
      value: prevState.value - 1,
    }));
  };

  return (
    <CounterPane color={color}>
      <label style={{ userSelect: "none" }}>
        {label}
        <input
          style={{
            textColor,
            width: "100%",
            display: "block",
            textAlign: "center",
            border: "none",
            margin: "0.2em 0",
            padding: "0.2em 0",
            fontSize: fontSize + "px",
            userSelect: "none",
          }}
          value={value}
          onChange={setValue}
        />
      </label>
      <span
        style={{
          paddingTop: "1em",
        }}
      >
        <button onClick={increment} style={{ fontSize: fontSize + "px" }}>
          +
        </button>
        <button onClick={decrement} style={{ fontSize: fontSize + "px" }}>
          -
        </button>
      </span>
    </CounterPane>
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
  text,
  backText,
  overlay,
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
        {text && (
          <div
            className="image-text"
            style={{
              position: "absolute",
              right: 0,
              padding: "0 3px",
              backgroundColor: "black",
              color: "white",
              borderRadius: "50%",
              userSelect: "none",
            }}
          >
            {backText}
          </div>
        )}
        <img
          src={backContent}
          alt=""
          draggable={false}
          {...size}
          style={{ userSelect: "none", pointerEvents: "none" }}
        />
      </>
    );
  } else {
    image = (
      <div className="image-wrapper" style={{ position: "relative" }}>
        {unflippedFor && (
          <div
            style={{
              position: "absolute",
              top: "-18px",
              left: "4px",
              color: "#555",
              backgroundColor: "#CCCCCCA0",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            Only you
          </div>
        )}
        {overlay && (
          <img
            src={overlay.content}
            alt=""
            style={{
              position: "absolute",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        )}
        {text && (
          <div
            className="image-text"
            style={{
              position: "absolute",
              right: 0,
              padding: "0 3px",
              backgroundColor: "black",
              color: "white",
              borderRadius: "50%",
              userSelect: "none",
            }}
          >
            {text}
          </div>
        )}
        <img
          src={content}
          alt=""
          draggable={false}
          {...size}
          style={{ userSelect: "none", pointerEvents: "none" }}
        />
      </div>
    );
  }

  return <div onDoubleClick={onDblClick}>{image}</div>;
};

const getComponent = (type) => {
  switch (type) {
    case "rect":
      return Rect;
    case "round":
      return Round;
    case "image":
      return Image;
    case "counter":
      return Counter;
    default:
      return Rect;
  }
};

const ItemWrapper = styled.div.attrs(() => ({
  className: "item",
}))`
  ${({ rotation, x, y }) => css`
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    display: inline-block;
    box-sizing: content-box;
    transform: rotate(${rotation} deg);
  `}
  ${({ selected }) => {
    if (selected) {
      return css`
        border: 2px dashed #ff0000a0;
        padding: 2px;
      `;
    } else {
      return css`
        padding: 4px;
      `;
    }
  }}
`;

const Item = ({ setState, state }) => {
  const selectedItems = useRecoilValue(selectedItemsAtom);
  const itemRef = React.useRef(null);
  const sizeRef = React.useRef({
    actualWidth: state.width,
    actualHeight: state.height,
  });
  const [unlock, setUnlock] = React.useState(false);

  React.useEffect(() => {
    // Add id to element
    itemRef.current.id = state.id;
  }, [state]);

  // Allow to operate on locked item if ctrl is pressed
  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Control") {
        setUnlock(true);
      }
    };
    const onKeyUp = (e) => {
      if (e.key === "Control") {
        setUnlock(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const Component = getComponent(state.type);

  const rotation = state.rotation || 0;

  const updateState = React.useCallback(
    (callbackOrItem, sync = true) => setState(state.id, callbackOrItem, sync),
    [setState, state]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const actualSizeCallback = React.useCallback(
    debounce((entries) => {
      entries.forEach((entry) => {
        if (entry.contentBoxSize) {
          const { inlineSize: width, blockSize: height } = entry.contentBoxSize;
          if (
            sizeRef.current.actualWidth !== width ||
            sizeRef.current.actualHeight !== height
          ) {
            sizeRef.current.actualWidth = width;
            sizeRef.current.actualHeight = height;
            updateState(
              (prevState) => ({
                ...prevState,
                actualWidth: width,
                actualHeight: height,
              }),
              false // Don't want to sync that.
            );
          }
        }
      });
    }, 1000),
    [updateState]
  );

  // Update actual size when update
  React.useEffect(() => {
    const currentElem = itemRef.current;
    const observer = new ResizeObserver(actualSizeCallback);
    observer.observe(currentElem);
    return () => {
      observer.unobserve(currentElem);
    };
  }, [actualSizeCallback]);

  const content = (
    <ItemWrapper
      x={state.x}
      y={state.y}
      rotation={rotation}
      selected={selectedItems.includes(state.id)}
      ref={itemRef}
    >
      <Component {...state} updateState={updateState} />
    </ItemWrapper>
  );

  if (!state.locked || unlock) {
    return content;
  }

  return (
    <div
      style={{
        pointerEvents: "none",
        userSelect: "none",
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
