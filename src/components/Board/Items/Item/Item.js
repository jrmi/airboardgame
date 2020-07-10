import React, { memo } from "react";
import { useC2C } from "../../../../hooks/useC2C";
import { useRecoilValue } from "recoil";
import { selectedItemsAtom } from "../../Selector";
import debounce from "lodash.debounce";

import styled, { css } from "styled-components";

import Rect from "./Rect";
import Round from "./Round";
import Image from "./Image";
import Counter from "./Counter";
import Dice from "./Dice";
import Note from "./Note";

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
    case "note":
      return Note;
    default:
      return Rect;
  }
};

const ItemWrapper = styled.div.attrs(({ x, y, rotation, loaded }) => ({
  className: loaded ? "item loaded" : "item",
  style: {
    left: `${x}px`,
    top: `${y}px`,
    transform: `rotate(${rotation}deg)`,
  },
}))`
  position: absolute;
  display: inline-block;
  transition: transform 200ms;
  z-index: ${({ layer }) => (layer || 0) + 3};
  opacity: 0.5;
  &.loaded {
    opacity: 1;
  }
  ${({ selected }) =>
    selected
      ? css`
          border: 2px dashed #ff0000a0;
          padding: 2px;
          cursor: pointer;
        `
      : css`
          padding: 4px;
        `}
  ${({ locked }) =>
    locked &&
    css`
      pointer-events: none;
      user-select: none;
    `}
`;

const Item = ({ setState, state }) => {
  const selectedItems = useRecoilValue(selectedItemsAtom);
  const itemRef = React.useRef(null);
  const sizeRef = React.useRef({});
  const [unlock, setUnlock] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  // Allow to operate on locked item if key is pressed
  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "u" || e.key === "l") {
        setUnlock(true);
      }
    };
    const onKeyUp = (e) => {
      if (e.key === "u" || e.key === "l") {
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
    [setState, state.id]
  );

  // Update actual dimension. Usefull when image with own dimensions.
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
            setLoaded(true);
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

  return (
    <ItemWrapper
      x={state.x}
      y={state.y}
      rotation={rotation}
      locked={state.locked && !unlock}
      selected={selectedItems.includes(state.id)}
      ref={itemRef}
      layer={state.layer}
      loaded={loaded}
      id={state.id}
    >
      <Component {...state} x={0} y={0} setState={updateState} />
    </ItemWrapper>
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

export default memo(
  SyncedItem,
  (
    { state: prevState, setState: prevSetState },
    { state: nextState, setState: nextSetState }
  ) => {
    return (
      JSON.stringify(prevState) === JSON.stringify(nextState) &&
      prevSetState === nextSetState
    );
  }
);
