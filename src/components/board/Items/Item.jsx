import React, { memo } from "react";

import styled from "styled-components";
import lockIcon from "../../../images/lock.svg";

const ItemWrapper = styled.div.attrs(({ rotation, locked, selected }) => {
  let className = "item";
  if (locked) {
    className += " locked";
  }
  if (selected) {
    className += " selected";
  }
  return {
    className,
    style: {
      transform: `rotate(${rotation}deg)`,
    },
  };
})`
  display: inline-block;
  transition: transform 150ms;
  user-select: none;

  & .corner {
    position: absolute;
    width: 0px;
    height: 0px;
  }

  & .top-left {
    top: 0;
    left: 0;
  }
  & .top-right {
    top: 0;
    right: 0;
  }
  & .bottom-left {
    bottom: 0;
    left: 0;
  }
  & .bottom-right {
    bottom: 0;
    right: 0;
  }

  padding: 4px;

  &.selected {
    border: 2px dashed var(--color-primary);
    padding: 2px;
    cursor: pointer;
  }

  &.locked::after {
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

  &.locked:hover::after {
    opacity: 0.3;
  }
`;

const Item = ({
  setState,
  state: { type, rotation = 0, id, locked, layer, ...rest } = {},
  animate = "hvr-pop",
  isSelected,
  itemMap,
  unlocked,
}) => {
  const itemRef = React.useRef(null);
  const isMountedRef = React.useRef(false);
  const animateRef = React.useRef(null);

  const Component = itemMap[type].component || null;

  const updateState = React.useCallback(
    (callbackOrItem, sync = true) => setState(id, callbackOrItem, sync),
    [setState, id]
  );

  // Update actual size when update
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    animateRef.current.className = animate;
  }, [animate]);

  const removeClass = (e) => {
    e.target.className = "";
  };

  return (
    <ItemWrapper
      rotation={rotation}
      locked={locked && !unlocked}
      selected={isSelected}
      ref={itemRef}
      layer={layer}
      id={id}
    >
      <div
        ref={animateRef}
        onAnimationEnd={removeClass}
        onKeyDown={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
      >
        <Component {...rest} setState={updateState} />
        <div className="corner top-left"></div>
        <div className="corner top-right"></div>
        <div className="corner bottom-left"></div>
        <div className="corner bottom-right"></div>
      </div>
    </ItemWrapper>
  );
};

const MemoizedItem = memo(
  Item,
  (
    {
      state: prevState,
      setState: prevSetState,
      isSelected: prevIsSelected,
      unlocked: prevUnlocked,
    },
    {
      state: nextState,
      setState: nextSetState,
      isSelected: nextIsSelected,
      unlocked: nextUnlocked,
    }
  ) => {
    return (
      prevIsSelected === nextIsSelected &&
      prevUnlocked === nextUnlocked &&
      prevSetState === nextSetState &&
      JSON.stringify(prevState) === JSON.stringify(nextState)
    );
  }
);

// Exclude positionning from memoization
const PositionedItem = ({
  state: { x, y, layer, moving, ...stateRest } = {},
  ...rest
}) => {
  return (
    <div
      style={{
        transform: `translate(${x}px, ${y}px)`,
        display: "inline-block",
        zIndex: ((layer || 0) + 4) * 10 + 100 + (moving ? 5 : 0), // Items z-index between 100 and 200
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <MemoizedItem {...rest} state={stateRest} />
    </div>
  );
};

const MemoizedPositionedItem = memo(PositionedItem);

export default MemoizedPositionedItem;
