import React from "react";
import { memo } from "react";
import styled, { css } from "styled-components";
import { isItemInsideElement } from "../utils";
import useItemInteraction from "../components/board/Items/useItemInteraction";
import useGameItemActionMap from "./useGameItemActionMap";

const ZoneWrapper = styled.div`
  ${({ width = 200, height = 200 }) => css`
    width: ${width}px;
    height: ${height}px;
    border: 0.5em dotted #ccc;
    opacity: 0.2;
    border-radius: 1em;
    position: relative;
    & > div {
      font-size: 1.5em;
      letter-spacing: -3px;
      user-select: none;
      background-color: #ccc;
      position: absolute;
      padding: 1em 0em;
      top: 1em;
      left: -1em;
      border-radius: 0.5em;
      color: var(--color-darkGrey);
      writing-mode: vertical-rl;
      text-orientation: upright;
    }
  `}
`;

const Zone = ({ width, height, label, onItem }) => {
  const { register } = useItemInteraction("place");
  const { setFlip, setFlipSelf, stack } = useGameItemActionMap();
  const zoneRef = React.useRef(null);

  const onInsideItem = React.useCallback(
    (itemIds) => {
      const insideItems = itemIds.filter((itemId) =>
        isItemInsideElement(document.getElementById(itemId), zoneRef.current)
      );
      if (!insideItems.length) return;
      onItem.forEach((action) => {
        switch (action) {
          case "reveal":
            setFlip(insideItems, { flip: false });
            break;
          case "hide":
            setFlip(insideItems, { flip: true });
            break;
          case "revealSelf":
            setFlipSelf(insideItems, { flipSelf: true });
            break;
          case "hideSelf":
            setFlipSelf(insideItems, { flipSelf: false });
            break;
          case "stack":
            stack(insideItems);
            break;
        }
      });
    },
    [onItem, setFlip, setFlipSelf, stack]
  );

  React.useEffect(() => {
    const unregisterList = [];
    if (onItem?.length) {
      unregisterList.push(register(onInsideItem));
    }
    return () => {
      unregisterList.forEach((callback) => callback());
    };
  }, [onInsideItem, onItem, register, setFlip]);

  return (
    <ZoneWrapper width={width} height={height} ref={zoneRef}>
      <div>{label}</div>
    </ZoneWrapper>
  );
};

export default memo(Zone);
