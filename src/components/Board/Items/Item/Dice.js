import React, { memo } from "react";
import styled, { css } from "styled-components";
import { useTranslation } from "react-i18next";

const DicePane = styled.div`
  ${({ color, fontSize }) => css`
    background-color: ${color};
    width: 5em;
    padding: 0.3em;
    text-align: center;
    fontsize: ${fontSize}px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    border-radius: 10px;
    box-shadow: 3px 3px 8px 0px rgb(0, 0, 0, 0.3);
    h3 {
      user-select: none;
      padding: 0;
    }
  `}
`;

const getRandomInt = (sides) => {
  let min = 1;
  let max = Math.ceil(sides);
  return Math.floor(Math.random() * max) + min;
};

const Dice = ({
  value = 0,
  color = "#CCC",
  label = "",
  side = 6,
  textColor = "#000",
  fontSize = "16",
  setState,
}) => {
  const { t } = useTranslation();
  const setValue = (e) => {
    setState((prevState) => ({
      ...prevState,
      value: e.target.value,
    }));
  };

  const roll = () => {
    const simulateRoll = (nextTimeout) => {
      setState((prevState) => ({
        ...prevState,
        value: getRandomInt(side),
      }));
      if (nextTimeout < 200) {
        setTimeout(
          () => simulateRoll(nextTimeout + getRandomInt(30)),
          nextTimeout
        );
      }
    };
    simulateRoll(100);
  };

  return (
    <DicePane color={color} fontSize={fontSize}>
      <h3>{label}</h3>
      <label style={{ userSelect: "none" }}>
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
      <span>
        <button onClick={roll} style={{ fontSize: fontSize + "px" }}>
          {t("Roll")}
        </button>
      </span>
    </DicePane>
  );
};

export default memo(Dice);
