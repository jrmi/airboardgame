import React from "react";
import styled, { css } from "styled-components";

const CounterPane = styled.div`
  ${({ color, fontSize }) => css`
    background-color: ${color};
    width: 5em;
    padding: 0.5em;
    padding-bottom: 2em;
    text-align: center;
    fontsize: ${fontSize}px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    border-radius: 0.5em;
    box-shadow: 10px 10px 13px 0px rgb(0, 0, 0, 0.3);
  `}
`;

const Counter = ({
  value = 0,
  color = "#CCC",
  label = "",
  textColor = "#000",
  fontSize = "16",
  updateState,
}) => {
  const setValue = (e) => {
    updateState((prevState) => ({
      ...prevState,
      value: e.target.value,
    }));
  };

  const increment = () => {
    updateState((prevState) => ({
      ...prevState,
      value: prevState.value + 1,
    }));
  };

  const decrement = () => {
    updateState((prevState) => ({
      ...prevState,
      value: prevState.value - 1,
    }));
  };

  return (
    <CounterPane color={color} fontSize={fontSize}>
      <label style={{ userSelect: "none" }}>
        {label}
        <input
          style={{
            textColor,
            width: "100%",
            display: "block",
            textAlign: "center",
            border: "none",
            margin: "0.2em 0",
            padding: "0.2em 0",
            fontSize: fontSize + "px",
            userSelect: "none",
          }}
          value={value}
          onChange={setValue}
        />
      </label>
      <span
        style={{
          paddingTop: "1em",
        }}
      >
        <button onClick={increment} style={{ fontSize: fontSize + "px" }}>
          +
        </button>
        <button onClick={decrement} style={{ fontSize: fontSize + "px" }}>
          -
        </button>
      </span>
    </CounterPane>
  );
};

export default Counter;
