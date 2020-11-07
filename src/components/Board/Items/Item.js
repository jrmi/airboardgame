import React, { memo } from "react";

import styled, { css } from "styled-components";
import lockIcon from "../../../images/lock.svg";

const ItemWrapper = styled.div.attrs(({ rotation, locked }) => {
  let className = "item";
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
  transition: transform 150ms;
  user-select: none;

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
  state: { type, x, y, rotation = 0, id, locked, layer, ...rest } = {},
  isSelected,
  getComponent,
}) => {
  const itemRef = React.useRef(null);
  const [unlock, setUnlock] = React.useState(false);
  const isMountedRef = React.useRef(false);
  const effectRef = React.useRef(null);

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

  const removeClass = () => {
    effectRef.current.className = "";
  };

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
        id={id}
      >
        <div className="hvr-pop" ref={effectRef} onAnimationEnd={removeClass}>
          <Component {...rest} setState={updateState} />
        </div>
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

export default MemoizedItem;
