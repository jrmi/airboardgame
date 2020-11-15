import React, { memo } from "react";
import styled, { css } from "styled-components";

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
}) => {
  return (
    <StyledCheckerBoard
      width={width}
      height={height}
      rowCount={rowCount}
      colCount={colCount}
      color={color}
      alternateColor={alternateColor}
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
