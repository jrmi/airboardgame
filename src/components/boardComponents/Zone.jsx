import React from "react";
import { memo } from "react";
import styled, { css } from "styled-components";

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

const Zone = ({ width, height, label }) => {
  return (
    <ZoneWrapper width={width} height={height}>
      <div>{label}</div>
    </ZoneWrapper>
  );
};

export default memo(Zone);
