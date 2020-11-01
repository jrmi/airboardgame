import React, { memo } from "react";
import styled, { css } from "styled-components";

const StyledRound = styled.div`
  ${({ radius = 50, color = "#ccc" }) => css`
    border-radius: 100%;
    width: ${radius}px;
    height: ${radius}px;
    background-color: ${color};
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
      rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
  `}
`;

const Round = ({
  size,
  radius = size,
  color,
  text = "",
  textColor = "#000",
  fontSize = "16",
}) => {
  return (
    <StyledRound radius={radius} color={color}>
      <span
        style={{
          textColor,
          fontSize: fontSize + "px",
        }}
      >
        {text}
      </span>
    </StyledRound>
  );
};

export default memo(Round);
