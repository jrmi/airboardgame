import React, { memo } from "react";
import styled, { css } from "styled-components";
import { useItemInteraction } from "react-sync-board";

import { isItemCenterInsideElement, getItemElement } from "../../utils/item";

const StyledCheckerBoard = styled.div`
  ${({ width, height, color, alternateColor, colCount, rowCount }) => css`
    width: ${width}px;
    height: ${height}px;
    background-color: ${color};
    display: grid;
    grid-template-columns: repeat(${colCount}, 1fr);
    grid-template-rows: repeat(${rowCount}, 1fr);
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
      rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;

    & .alternate {
      background-color: ${alternateColor};
    }
  `}
`;

const CheckerBoard = ({
  width = 50,
  height = width,
  color = "#CCC",
  alternateColor = "#888",
  colCount = 3,
  rowCount = 3,
  holdItems,
  setState,
}) => {
  const { register } = useItemInteraction("place");
  const wrapperRef = React.useRef(null);

  const onInsideItem = React.useCallback(
    (itemIds) => {
      const whetherCenterItemIsInside = Object.fromEntries(
        itemIds.map((itemId) => [
          itemId,
          isItemCenterInsideElement(getItemElement(itemId), wrapperRef.current),
        ])
      );
      const insideItems = itemIds.filter(
        (itemId) => whetherCenterItemIsInside[itemId]
      );

      if (holdItems) {
        setState((item) => {
          const { linkedItems = [] } = item;
          // Remove outside items from linkedItems
          const linkedItemsCleaned = linkedItems.filter(
            (itemId) => whetherCenterItemIsInside[itemId] !== false
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
    },
    [holdItems, setState]
  );

  React.useEffect(() => {
    const unregisterList = [];
    unregisterList.push(register(onInsideItem));

    return () => {
      unregisterList.forEach((callback) => callback());
    };
  }, [onInsideItem, register]);

  return (
    <StyledCheckerBoard
      width={width}
      height={height}
      rowCount={rowCount}
      colCount={colCount}
      color={color}
      alternateColor={alternateColor}
      ref={wrapperRef}
    >
      {Array.from({ length: rowCount }).map((_, indexRow) =>
        Array.from({ length: colCount }).map((_, indexCol) => (
          <div
            key={`${indexCol}__${indexRow}`}
            className={
              indexRow % 2
                ? indexCol % 2
                  ? "alternate"
                  : ""
                : !(indexCol % 2)
                ? "alternate"
                : ""
            }
          />
        ))
      )}
    </StyledCheckerBoard>
  );
};

export default memo(CheckerBoard);
