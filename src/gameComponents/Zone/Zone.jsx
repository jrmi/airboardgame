import React from "react";
import { memo } from "react";
import styled, { css } from "styled-components";
import { useItemInteraction } from "react-sync-board";
import { opacify } from "color2k";

import { isItemInsideElement, getItemElement } from "../../utils";
import useGameItemActions from "../useGameItemActions";

const ZoneWrapper = styled.div`
  ${({ width, height, borderColor, borderStyle, backgroundColor }) => css`
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
  width = 200,
  height = 200,
  borderColor = "#cccccc33",
  borderStyle = "dotted",
  backgroundColor = "transparent",
  labelPosition = "left",
  label,
  holdItems = false,
  setState,
  onItem,
}) => {
  const { register } = useItemInteraction("place");
  const zoneRef = React.useRef(null);
  const { actionMap } = useGameItemActions();

  const onInsideItem = React.useCallback(
    (itemIds) => {
      const whetherItemIsInside = Object.fromEntries(
        itemIds.map((itemId) => [
          itemId,
          isItemInsideElement(getItemElement(itemId), zoneRef.current),
        ])
      );
      const insideItems = itemIds.filter(
        (itemId) => whetherItemIsInside[itemId]
      );

      if (holdItems) {
        setState((item) => {
          const { linkedItems = [] } = item;
          // Remove outside items from linkedItems
          const linkedItemsCleaned = linkedItems.filter(
            (itemId) => whetherItemIsInside[itemId] !== false
          );
          const newLinkedItems = Array.from(
            new Set(linkedItemsCleaned.concat(insideItems))
          );

          return {
            ...item,
            linkedItems: newLinkedItems,
          };
        });
      }

      if (onItem && insideItems.length) {
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
      }
    },
    [actionMap, holdItems, onItem, setState]
  );

  React.useEffect(() => {
    if (!holdItems && setState) {
      setState((item) => ({ ...item, linkedItems: [] }));
    }
  }, [holdItems, setState]);

  React.useEffect(() => {
    const unregisterList = [];
    unregisterList.push(register(onInsideItem));

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
