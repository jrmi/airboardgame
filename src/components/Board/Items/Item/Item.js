import React, { memo } from "react";
import { useRecoilValue } from "recoil";
import { selectedItemsAtom } from "../../Selector";
import { ItemsFamily } from "../../";
import debounce from "lodash.debounce";

import styled, { css } from "styled-components";
import lockIcon from "../../../../images/lock.svg";

import { getComponent } from "./allItems";

const ItemWrapper = styled.div.attrs(({ rotation, loaded, locked }) => {
  let className = "item";
  if (loaded) {
    className += " loaded";
  }
  if (locked) {
    className += " locked";
  }
  return {
    className,
    style: {
      transform: `rotate(${rotation}deg)`,
    },
  };
})`
  display: inline-block;
  transition: transform 200ms;
  user-select: none;
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
      &::after {
        content: "";
        position: absolute;
        width: 24px;
        height: 30px;
        top: 4px;
        right: 4px;
        opacity: 0.1;
        background-image: url(${lockIcon});
        background-size: cover;
        user-select: none;
      }

      &:hover {
        &::after {
          opacity: 0.3;
        }
      }
    `}
`;

const Item = ({
  setState,
  state: { type, x, y, rotation = 0, id, locked, layer, ...rest },
  isSelected,
}) => {
  const itemRef = React.useRef(null);
  const sizeRef = React.useRef({});
  const [unlock, setUnlock] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const isMountedRef = React.useRef(false);

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

  const Component = getComponent(type);

  const updateState = React.useCallback(
    (callbackOrItem, sync = true) => setState(id, callbackOrItem, sync),
    [setState, id]
  );

  // Update actual dimension. Usefull when image with own dimensions.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const actualSizeCallback = React.useCallback(
    debounce((entries) => {
      if (!isMountedRef.current) return;
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
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
    <div
      style={{
        transform: `translate(${x}px, ${y}px)`,
        display: "inline-block",
        zIndex: (layer || 0) + 3,
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <ItemWrapper
        rotation={rotation}
        locked={locked && !unlock}
        selected={isSelected}
        ref={itemRef}
        layer={layer}
        loaded={loaded}
        id={id}
      >
        <Component {...rest} x={0} y={0} setState={updateState} />
      </ItemWrapper>
    </div>
  );
};

const MemoizedItem = memo(
  Item,
  (
    { state: prevState, setState: prevSetState, isSelected: prevIsSelected },
    { state: nextState, setState: nextSetState, isSelected: nextIsSelected }
  ) => {
    return (
      JSON.stringify(prevState) === JSON.stringify(nextState) &&
      prevSetState === nextSetState &&
      prevIsSelected === nextIsSelected
    );
  }
);

const BaseItem = ({ setState, state }) => {
  const selectedItems = useRecoilValue(selectedItemsAtom);
  const realState = useRecoilValue(ItemsFamily(state.id));
  return (
    <MemoizedItem
      state={realState}
      setState={setState}
      isSelected={selectedItems.includes(state.id)}
    />
  );
};

export default BaseItem;
