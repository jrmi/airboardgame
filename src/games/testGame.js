const genGame = () => {
  const items = [];

  items.push({
    type: "image",
    content: "/games/card.jpg",
    backContent: "/games/back.jpg",
    width: 100,
    x: 100,
    y: 100,
  });

  items.push({
    type: "rect",
    color: "#00D022",
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  });

  items.push({
    type: "round",
    color: "#D00022",
    radius: 80,
    x: 500,
    y: 500,
  });

  items.push({
    type: "counter",
    color: "#D00022",
    x: 50,
    y: 50,
  });

  return {
    items,
    board: { size: 1000, scale: 0.5 },
  };
};

export const testGame = genGame();

export default testGame;
