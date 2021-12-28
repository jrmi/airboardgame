import React, { memo } from "react";
import styled from "styled-components";
import { useItemInteraction } from "react-sync-board";
import { media2Url } from "../mediaLibrary";

const DicePane = styled.div`
  line-height: 0;
  img {
    ${({ width }) => (width ? `width: ${width}px;` : "")}
    ${({ height }) =>
      height ? `height: ${height}px;` : ""}
    pointer-events: none;
  }
`;

const getRandomInt = (sides) => {
  let min = 1;
  let max = Math.ceil(sides);
  return Math.floor(Math.random() * max) + min;
};

const defaultDiceImages = [
  "/game_assets/dice/one.svg",
  "/game_assets/dice/two.svg",
  "/game_assets/dice/three.svg",
  "/game_assets/dice/four.svg",
  "/game_assets/dice/five.svg",
  "/game_assets/dice/six.svg",
];

const Dice = ({
  id,
  value = 0,
  side = 6,
  images = defaultDiceImages,
  width = 50,
  height = 50,
  rollOnDblClick = false,
  setState,
}) => {
  const { register } = useItemInteraction("place");
  const diceWrapper = React.useRef(null);

  const roll = React.useCallback(() => {
    diceWrapper.current.className = "hvr-wobble-horizontal";
    const simulateRoll = (nextTimeout) => {
      setState((prevState) => ({
        ...prevState,
        value: getRandomInt(side - 1),
      }));
      if (nextTimeout < 200) {
        setTimeout(
          () => simulateRoll(nextTimeout + getRandomInt(30)),
          nextTimeout
        );
      }
    };
    simulateRoll(100);
  }, [setState, side]);

  const removeClass = (e) => {
    e.target.className = "";
  };

  React.useEffect(() => {
    const unregisterList = [];
    if (!rollOnDblClick) {
      const rollOnPlace = (itemIds) => {
        if (itemIds.includes(id)) {
          roll();
        }
      };

      unregisterList.push(register(rollOnPlace));
    }
    return () => {
      unregisterList.forEach((callback) => callback());
    };
  }, [roll, register, rollOnDblClick, id]);

  return (
    <div onAnimationEnd={removeClass} ref={diceWrapper}>
      <DicePane
        width={width}
        height={height}
        onDoubleClick={() => (rollOnDblClick ? roll() : null)}
      >
        {images[value] && <img src={media2Url(images[value])} />}
      </DicePane>
    </div>
  );
};

export default memo(Dice);
