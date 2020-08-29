import React from "react";
import { memo } from "react";
import styled, { css } from "styled-components";

const ZoneWrapper = styled.div`
  ${({ width = 200, height = 200 }) => css`
    width: ${width}px;
    height: ${height}px;
    border: 0.8em dashed #222;
    opacity: 0.3;
    border-radius: 1em;
    display: flex;
    align-items: center;
    justify-content: center;
    & > div {
      font-size: 3em;
      user-select: none;
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
