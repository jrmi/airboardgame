import { memo } from "react";
import styled, { css } from "styled-components";

const Rect = styled.div`
  ${({ width, height, color }) => css`
    width: ${width}px;
    height: ${height}px;
    background-color: ${color};
  `}
`;

export default memo(Rect);
