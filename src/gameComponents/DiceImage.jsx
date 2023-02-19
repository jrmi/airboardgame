import React, { memo } from "react";
import styled from "styled-components";
import { useItemInteraction } from "react-sync-board";
import { media2Url } from "../mediaLibrary";
import useGameItemActions from "./useGameItemActions";

const DicePane = styled.div`
  line-height: 0;
  img {
    ${({ width }) => (width ? `width: ${width}px;` : "")}
    ${({ height }) =>
      height ? `height: ${height}px;` : ""}
    pointer-events: none;
  }
`;

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
  images,
  width = 50,
  height = 50,
  rollOnDblClick = false,
  rollOnMove = !rollOnDblClick,
}) => {
  const { register } = useItemInteraction("place");
  const { roll } = useGameItemActions();

  React.useEffect(() => {
    const unregisterList = [];
    if (rollOnMove) {
      const rollOnPlace = (itemIds) => {
        if (itemIds.includes(id)) {
          roll([id]);
        }
      };

      unregisterList.push(register(rollOnPlace));
    }
    return () => {
      unregisterList.forEach((callback) => callback());
    };
  }, [roll, register, id, rollOnMove]);

  return (
    <DicePane width={width} height={height}>
      {images[value] && <img src={media2Url(images[value])} />}
    </DicePane>
  );
};

export default memo(Dice);
