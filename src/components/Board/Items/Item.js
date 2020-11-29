import React, { memo } from "react";

import styled from "styled-components";
import { useSpring, animated } from "react-spring";

import lockIcon from "../../../images/lock.svg";

const ItemWrapper = animated(styled.div.attrs(({ locked, selected }) => {
  let className = "item";
  if (locked) {
    className += " locked";
  }
  if (selected) {
    className += " selected";
  }
  return {
    className,
    style: {},
  };
})`
  display: inline-block;
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
    border: 2px dashed #ff0000a0;
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
`);

const Item = ({
  setState,
  state: {
    type,
    x: baseX,
    y: baseY,
    rotation = 0,
    id,
    locked,
    layer,
    ...rest
  } = {},
  animate = "hvr-pop",
  isSelected,
  getComponent,
}) => {
  const itemRef = React.useRef(null);
  const [unlock, setUnlock] = React.useState(false);
  const isMountedRef = React.useRef(false);
  const animateRef = React.useRef(null);

  const transform = useSpring({
    x: baseX,
    y: baseY,
    rotate: rotation,
    config: { mass: 1, tension: 450, friction: 25 },
  });

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
    <animated.div
      style={{
        ...transform,
        display: "inline-block",
        zIndex: (layer || 0) + 3,
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <ItemWrapper
        locked={locked && !unlock}
        selected={isSelected}
        ref={itemRef}
        layer={layer}
        id={id}
      >
        <div ref={animateRef} onAnimationEnd={removeClass}>
          <Component {...rest} setState={updateState} />
          <div className="corner top-left"></div>
          <div className="corner top-right"></div>
          <div className="corner bottom-left"></div>
          <div className="corner bottom-right"></div>
        </div>
      </ItemWrapper>
    </animated.div>
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

export default MemoizedItem;
