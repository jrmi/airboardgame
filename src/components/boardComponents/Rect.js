import React, { memo } from "react";
import styled, { css } from "styled-components";

const StyledShape = styled.div`
  ${({ width, height }) => css`
    width: ${width}px;
    height: ${height}px;
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
      rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    & svg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    & span {
      z-index: 0;
    }
  `}
`;

const Rect = ({
  width = 50,
  height = 50,
  color = "#ccc",
  text = "",
  textColor = "#000",
  fontSize = "16",
}) => {
  return (
    <StyledShape width={width} height={height}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          style={{
            fill: color,
          }}
        />
      </svg>
      {text && (
        <span
          style={{
            textColor,
            fontSize: fontSize + "px",
          }}
        >
          {text}
        </span>
      )}
    </StyledShape>
  );
};

export default memo(Rect);
