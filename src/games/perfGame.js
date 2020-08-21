import { nanoid } from "nanoid";
const infoText = `# Test game

This is a test game.

With a [link](https://github.com/jrmi/airboardgame/).

`;

const genGame = () => {
  const items = [...Array(2000)].map((e, index) => ({
    type: "rect",
    x: 10 + index,
    y: 10 + index,
    width: 100,
    height: 100,
    id: nanoid(),
  }));
  return {
    items,
    availableItems: [
      {
        groupId: "Group",
        label: "Rect",
        type: "rect",
        color: "#00D022",
        width: 80,
        height: 80,
      },
    ],
    board: {
      size: 3000,
      scale: 1,
      info: infoText,
    },
  };
};

export const testGame = genGame();

export default testGame;
