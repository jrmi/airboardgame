import { memo } from "react";
import styled, { css } from "styled-components";

const Rect = styled.div`
  ${({ width = 50, height = 50, color = "#ccc" }) => css`
    width: ${width}px;
    height: ${height}px;
    background-color: ${color};
  `}
`;

export default memo(Rect);
