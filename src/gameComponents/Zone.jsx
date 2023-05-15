import React from "react";
import { memo } from "react";
import styled, { css } from "styled-components";
import { useItemInteraction } from "react-sync-board";
import { opacify } from "color2k";

import { isItemInsideElement, getItemElement } from "../utils";
import useGameItemActions from "./useGameItemActions";

const ZoneWrapper = styled.div`
  ${({
    width = 200,
    height = 200,
    borderColor = "#cccccc33",
    borderStyle = "dotted",
    backgroundColor = "transparent",
  }) => css`
    width: ${width}px;
    height: ${height}px;
    border: 0.5em ${borderStyle} ${borderColor};
    background-color: ${backgroundColor};
    border-radius: 5px;
    position: relative;
    & .zone__label {
      font-size: 1.5em;
      user-select: none;
      background-color: ${opacify(borderColor, 1)};
      position: absolute;
      border-radius: 0.5em;
      color: var(--color-darkGrey);
    }

    & .zone__label.left {
      padding: 1em 0em;
      top: 1em;
      left: -1em;
      letter-spacing: -3px;
      writing-mode: vertical-rl;
      text-orientation: upright;
    }

    & .zone__label.top {
      padding: 0em 1em;
      top: -1em;
      left: 1em;
    }
  `}
`;

const Zone = ({
  width,
  height,
  label,
  onItem,
  borderColor,
  borderStyle,
  backgroundColor,
  labelPosition = "left",
}) => {
  const { register } = useItemInteraction("place");
  const zoneRef = React.useRef(null);
  const { actionMap } = useGameItemActions();

  const onInsideItem = React.useCallback(
    (itemIds) => {
      const insideItems = itemIds.filter((itemId) =>
        isItemInsideElement(getItemElement(itemId), zoneRef.current)
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
          case "roll":
            actionMap["roll"].action(args)(insideItems);
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
    <ZoneWrapper
      width={width}
      height={height}
      ref={zoneRef}
      borderStyle={borderStyle}
      borderColor={borderColor}
      backgroundColor={backgroundColor}
    >
      <div className={`zone__label ${labelPosition}`}>{label}</div>
    </ZoneWrapper>
  );
};

export default memo(Zone);
