import React from "react";

import styled from "styled-components";

import { readableColorIsBlack } from "color2k";

const StyledCursor = styled.div.attrs(({ top, left }) => ({
  style: {
    transform: `translate(${left}px, ${top}px)`,
  },
}))`
  top: 0;
  left: 0;
  position: fixed;
  display: flex;
  flex-direction: row;
  align-items: center;
  z-index: 7;
`;

const CursorName = styled.div`
  color: ${({ textColor }) => textColor};
  font-weight: bold;
  padding: 0 0.5em;
  border-radius: 2px;
  max-width: 5em;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: -0.5em;
  margin-top: 1.7em;
  whitespace: nowrap;
  background-color: ${({ color }) => color};
`;

export const Cursor = ({ color = "#666", size = 40, pos, text }) => {
  const textColor = readableColorIsBlack(color) ? "#222" : "#EEE";
  return (
    <StyledCursor top={pos.y - 10} left={pos.x - 5}>
      <svg
        version="1.1"
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="1064.7701 445.5539 419.8101 717.0565"
        width={size}
        height={size}
      >
        <path
          d="m 1197.1015,869.718 -62.2719,-154.49286 133.3276,-9.05842 -257.6915,-253.12748 1.2392,356.98609 88.2465,-79.47087 61.702,152.78366 z"
          style={{
            fill: textColor,
          }}
        />
        <path
          d="m 1193.0939,861.12419 -62.2719,-154.49286 133.3276,-9.05842 -257.6915,-253.12748 1.2392,356.98609 88.2465,-79.47087 61.702,152.78366 z"
          style={{
            fill: "white",
            stroke: "#111",
            strokeWidth: 20,
          }}
        />
      </svg>

      <CursorName color={color} textColor={textColor}>
        {text}
      </CursorName>
    </StyledCursor>
  );
};

export default Cursor;
