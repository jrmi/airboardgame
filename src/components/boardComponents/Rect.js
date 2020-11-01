import { memo } from "react";
import styled, { css } from "styled-components";

const Rect = styled.div`
  ${({ width = 50, height = 50, color = "#ccc" }) => css`
    width: ${width}px;
    height: ${height}px;
    background-color: ${color};
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
      rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
  `}
`;

export default memo(Rect);
