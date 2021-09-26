import React from "react";
import { memo } from "react";
import styled, { css } from "styled-components";
import { useItemInteraction } from "react-sync-board";

import { isItemInsideElement } from "..//utils";
import useGameItemActions from "./useGameItemActions";

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
  const zoneRef = React.useRef(null);
  const { actionMap } = useGameItemActions();

  const onInsideItem = React.useCallback(
    (itemIds) => {
      const insideItems = itemIds.filter((itemId) =>
        isItemInsideElement(document.getElementById(itemId), zoneRef.current)
      );
      if (!insideItems.length) return;

      const onItemActions = onItem.map((action) => {
        if (typeof action === "string") {
          return { name: action };
        }
        return action;
      });

      onItemActions.forEach(({ name, args }) => {
        switch (name) {
          case "reveal":
            actionMap["reveal"].action(args)(insideItems);
            break;
          case "hide":
            actionMap["hide"].action(args)(insideItems);
            break;
          case "revealSelf":
            actionMap["revealSelf"].action(args)(insideItems);
            break;
          case "hideSelf":
            actionMap["hideSelf"].action(args)(insideItems);
            break;
          case "stack":
            actionMap["stack"].action(args)(insideItems);
            break;
        }
      });
    },
    [actionMap, onItem]
  );

  React.useEffect(() => {
    const unregisterList = [];
    if (onItem?.length) {
      unregisterList.push(register(onInsideItem));
    }
    return () => {
      unregisterList.forEach((callback) => callback());
    };
  }, [onInsideItem, onItem, register]);

  return (
    <ZoneWrapper width={width} height={height} ref={zoneRef}>
      <div>{label}</div>
    </ZoneWrapper>
  );
};

export default memo(Zone);
