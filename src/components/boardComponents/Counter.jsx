import React, { memo } from "react";
import styled, { css } from "styled-components";

const CounterPane = styled.div`
  ${({ color }) => css`
    background-color: ${color};
    padding: 0.2em;
    text-align: center;
    border-radius: 3px;
    box-shadow: 4px 4px 5px 0px rgb(0, 0, 0, 0.3);
    button {
      padding: 1rem;
    }
    input {
      width: 3em;
    }
    h3 {
      user-select: none;
      padding: 0;
      margin: 0;
    }
    div {
      display: flex;
      justify-content: space-between;
      flex-direction: row;
      align-items: center;
    }
  `}
`;

const Counter = ({
  value = 0,
  color = "#CCC",
  label = "",
  textColor = "#000",
  fontSize = "22",
  setState,
}) => {
  const setValue = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      value = 0;
    }

    setState((prevState) => ({
      ...prevState,
      value: value,
    }));
  };

  const increment = () => {
    setState((prevState) => ({
      ...prevState,
      value: (prevState.value || 0) + 1,
    }));
  };

  const decrement = () => {
    setState((prevState) => ({
      ...prevState,
      value: (prevState.value || 0) - 1,
    }));
  };

  return (
    <CounterPane color={color}>
      <h3>{label}</h3>
      <div>
        <button onClick={decrement} style={{ margin: "2px" }}>
          -
        </button>
        <label style={{ userSelect: "none" }}>
          <input
            style={{
              textColor,
              width: "4em",
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
        <button onClick={increment} style={{ margin: "2px" }}>
          +
        </button>
      </div>
    </CounterPane>
  );
};

export default memo(Counter);
