import React from "react";
import styled, { css } from "styled-components";

const StyledRound = styled.div`
  ${({ radius, color }) => css`
    border-radius: 100%;
    width: ${radius}px;
    height: ${radius}px;
    background-color: ${color};
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  `}
`;

const Round = ({
  radius,
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

export default Round;
