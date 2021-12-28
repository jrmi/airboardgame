import React from "react";
import { darken } from "color2k";
import styled, { css } from "styled-components";

const StyledShape = styled.div`
  ${({ size }) => css`
    width: ${size}px;
    height: ${size}px;
    perspective: 300px;
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
      transform: rotateX(25deg);
      padding-bottom: 0.2em;
    }
  `}
`;

const Token = ({
  size = 50,
  color = "#b3b3b3",
  text = "",
  textColor = "#000",
  fontSize = 24,
}) => {
  const colorDarken1 = darken(color, 0.25);
  return (
    <StyledShape size={size}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse
          ry="40"
          rx="49"
          cy="55"
          cx="50"
          id="ellipse2137"
          fill={colorDarken1}
        />
        <ellipse
          ry="40"
          rx="50"
          cy="45"
          cx="50"
          id="ellipse2139"
          fill={color}
        />
      </svg>
      {text && (
        <span
          style={{
            color: textColor,
            fontSize: fontSize + "px",
          }}
        >
          {text}
        </span>
      )}
    </StyledShape>
  );
};

export default Token;
