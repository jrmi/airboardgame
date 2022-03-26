import React, { memo } from "react";
import styled, { css } from "styled-components";
import { useTranslation } from "react-i18next";

const DicePane = styled.div`
  ${({ color }) => css`
    background-color: ${color};
    padding: 0.3em;
    text-align: center;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    align-items: center;
    border-radius: 3px;
    box-shadow: 3px 3px 8px 0px rgb(0, 0, 0, 0.3);

    & h3 {
      user-select: none;
      padding: 0;
      margin: 0;
    }

    .item-library__component & {
      transform: scale(0.8);
    }

    &
      input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="color"]):not([type="button"]):not([type="reset"]).result {
      width: 3em;
      display: block;
      text-align: center;
      border: none;
      margin: 0.2em 0;
      padding: 0.2em 0;
      user-select: none;
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
  fontSize = "22",
  setState,
}) => {
  const { t } = useTranslation();

  const diceWrapper = React.useRef(null);

  const setValue = (e) => {
    setState((prevState) => ({
      ...prevState,
      value: e.target.value,
    }));
  };

  const roll = () => {
    diceWrapper.current.className = "hvr-wobble-horizontal";
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

  const removeClass = (e) => {
    e.target.className = "";
  };

  return (
    <div onAnimationEnd={removeClass} ref={diceWrapper}>
      <DicePane color={color}>
        <h3>{label}</h3>
        <label style={{ userSelect: "none" }}>
          <input
            style={{
              textColor,
              fontSize: fontSize + "px",
            }}
            className="result"
            value={value}
            onKeyUp={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onChange={setValue}
          />
        </label>
        <span>
          <button onClick={roll}>{t("Roll")}</button>
        </span>
      </DicePane>
    </div>
  );
};

export default memo(Dice);
