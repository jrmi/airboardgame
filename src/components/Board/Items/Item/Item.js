import React, { memo } from "react";
import { useC2C } from "../../../../hooks/useC2C";
import { useRecoilValue } from "recoil";
import { selectedItemsAtom } from "../../Selector";
import debounce from "lodash.debounce";

import Rect from "./Rect";
import Round from "./Round";
import Image from "./Image";
import Counter from "./Counter";
import Dice from "./Dice";

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
    case "dice":
      return Dice;
    default:
      return Rect;
  }
};

const Item = ({ setState, state }) => {
  const selectedItems = useRecoilValue(selectedItemsAtom);
  const itemRef = React.useRef(null);
  const sizeRef = React.useRef({});
  const [unlock, setUnlock] = React.useState(false);

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
        if (entry.contentRect) {
          const { width, height } = entry.contentRect;
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

  const extraStyle = selectedItems.includes(state.id)
    ? { border: "2px dashed #ff0000a0", padding: "2px" }
    : { padding: "4px" };

  const content = (
    <div
      style={{
        left: state.x + "px",
        top: state.y + "px",
        position: "absolute",
        display: "inline-block",
        transform: `rotate(${rotation}deg)`,
        zIndex: (state.layer || 0) + 3,
        ...extraStyle,
      }}
      className="item"
      ref={itemRef}
      id={state.id}
    >
      <Component {...state} x={0} y={0} setState={updateState} />
    </div>
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

export default memo(SyncedItem);
