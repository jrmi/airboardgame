const genGame = () => {
  const items = [];

  // Resource Cards

  // 20
  [...Array(20)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/clay.png",
      backContent: "/games/settlers/back.png",
      width: 150,
      x: 100 - v,
      y: 300 - v,
    });

    items.push({
      type: "image",
      content: "/games/settlers/stone.png",
      backContent: "/games/settlers/back.png",
      width: 150,
      x: 300 - v,
      y: 300 - v,
    });

    items.push({
      type: "image",
      content: "/games/settlers/wood.png",
      backContent: "/games/settlers/back.png",
      width: 150,
      x: 500 - v,
      y: 300 - v,
    });

    items.push({
      type: "image",
      content: "/games/settlers/wheat.png",
      backContent: "/games/settlers/back.png",
      width: 150,
      x: 700 - v,
      y: 300 - v,
    });

    items.push({
      type: "image",
      content: "/games/settlers/sheep.png",
      backContent: "/games/settlers/back.png",
      width: 150,
      x: 900 - v,
      y: 300 - v,
    });
  });

  // search

  items.push({
    type: "image",
    content: "/games/settlers/cathedral.png",
    backContent: "/games/settlers/back.png",
    width: 150,
    x: 100,
    y: 700,
  });

  [...Array(15)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/knight.png",
      backContent: "/games/settlers/back.png",
      width: 150,
      x: 300 - v,
      y: 700 - v,
    });
  });

  items.push({
    type: "image",
    content: "/games/settlers/librarie.png",
    backContent: "/games/settlers/back.png",
    width: 150,
    x: 500,
    y: 700,
  });

  items.push({
    type: "image",
    content: "/games/settlers/market.png",
    backContent: "/games/settlers/back.png",
    width: 150,
    x: 700,
    y: 700,
  });

  [...Array(2)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/progress.png",
      backContent: "/games/settlers/back.png",
      width: 150,
      x: 900 - v,
      y: 700 - v,
    });
  });

  [...Array(2)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/progress2.png",
      backContent: "/games/settlers/back.png",
      width: 150,
      x: 1100 - v,
      y: 700 - v,
    });
  });

  [...Array(2)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/progress3.png",
      backContent: "/games/settlers/back.png",
      width: 150,
      x: 1300 - v,
      y: 700 - v,
    });
  });

  items.push({
    type: "image",
    content: "/games/settlers/universty.png",
    backContent: "/games/settlers/back.png",
    width: 150,
    x: 1500,
    y: 700,
  });

  items.push({
    type: "image",
    content: "/games/settlers/cathedral.png",
    backContent: "/games/settlers/back.png",
    width: 150,
    x: 1700,
    y: 700,
  });

  items.push({
    type: "image",
    content: "/games/settlers/cathedral.png",
    backContent: "/games/settlers/back.png",
    width: 150,
    x: 1700,
    y: 700,
  });

  // Tiles

  [...Array(3)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/tileClay.png",
      backContent: "/games/settlers/tileBack.png",
      width: 300,
      x: 100 - v,
      y: 1000 - v,
      rotation: 30,
    });
  });
  [...Array(3)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/tileStone.png",
      backContent: "/games/settlers/tileBack.png",
      width: 300,
      x: 400 - v,
      y: 1000 - v,
      rotation: 30,
    });
  });
  [...Array(4)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/tileSheep.png",
      backContent: "/games/settlers/tileBack.png",
      width: 300,
      x: 700 - v,
      y: 1000 - v,
      rotation: 30,
    });
  });
  [...Array(4)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/tileWheat.png",
      backContent: "/games/settlers/tileBack.png",
      width: 300,
      x: 1000 - v,
      y: 1000 - v,
      rotation: 30,
    });
  });
  [...Array(4)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/tileWood.png",
      backContent: "/games/settlers/tileBack.png",
      width: 300,
      x: 1300 - v,
      y: 1000 - v,
      rotation: 30,
    });
  });

  items.push({
    type: "image",
    content: "/games/settlers/tileDesert.png",
    backContent: "/games/settlers/tileBack.png",
    width: 300,
    x: 1600,
    y: 1000,
    rotation: 30,
  });

  [...Array(9)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/tileSea2.png",
      backContent: "/games/settlers/tileBack.png",
      width: 300,
      x: 1900 - v,
      y: 1000 - v,
      rotation: 30,
    });
  });

  [...Array(4)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/portAll.png",
      backContent: "/games/settlers/tileBack.png",
      width: 300,
      x: 300 - v,
      y: 1400 - v,
      rotation: 30,
    });
  });

  items.push({
    type: "image",
    content: "/games/settlers/portClay.png",
    backContent: "/games/settlers/tileBack.png",
    width: 300,
    x: 600,
    y: 1400,
    rotation: 30,
  });
  items.push({
    type: "image",
    content: "/games/settlers/portStone.png",
    backContent: "/games/settlers/tileBack.png",
    width: 300,
    x: 900,
    y: 1400,
    rotation: 30,
  });
  items.push({
    type: "image",
    content: "/games/settlers/portSheep.png",
    backContent: "/games/settlers/tileBack.png",
    width: 300,
    x: 1200,
    y: 1400,
    rotation: 30,
  });
  items.push({
    type: "image",
    content: "/games/settlers/portWheat.png",
    backContent: "/games/settlers/tileBack.png",
    width: 300,
    x: 1500,
    y: 1400,
    rotation: 30,
  });
  items.push({
    type: "image",
    content: "/games/settlers/portWood.png",
    backContent: "/games/settlers/tileBack.png",
    width: 300,
    x: 1800,
    y: 1400,
    rotation: 30,
  });

  // Tokens

  [...Array(5)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/houseRed.png",
      width: 70,
      x: 100 + 100 * v,
      y: 1800,
    });
  });

  [...Array(4)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/house2red.png",
      width: 90,
      x: 100 + 100 * v,
      y: 1900,
    });
  });

  [...Array(15)].forEach((_, v) => {
    items.push({
      type: "rect",
      color: "#FF0000",
      width: 20,
      height: 100,
      x: 700 + 40 * v,
      y: 1800,
    });
  });

  [...Array(5)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/houseBlue.png",
      width: 70,
      x: 100 + 100 * v,
      y: 2050,
    });
  });

  [...Array(4)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/house2Blue.png",
      width: 90,
      x: 100 + 100 * v,
      y: 2100,
    });
  });

  [...Array(15)].forEach((_, v) => {
    items.push({
      type: "rect",
      color: "#0000FF",
      width: 20,
      height: 100,
      x: 700 + 40 * v,
      y: 2050,
    });
  });

  [...Array(5)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/houseOrange.png",
      width: 70,
      x: 100 + 100 * v,
      y: 2250,
    });
  });

  [...Array(4)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/house2Orange.png",
      width: 90,
      x: 100 + 100 * v,
      y: 2300,
    });
  });

  [...Array(15)].forEach((_, v) => {
    items.push({
      type: "rect",
      color: "#ff6600",
      width: 20,
      height: 100,
      x: 700 + 40 * v,
      y: 2250,
    });
  });

  [...Array(5)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/houseWhite.png",
      width: 70,
      x: 100 + 100 * v,
      y: 2450,
    });
  });

  [...Array(4)].forEach((_, v) => {
    items.push({
      type: "image",
      content: "/games/settlers/house2White.png",
      width: 90,
      x: 100 + 100 * v,
      y: 2500,
    });
  });

  [...Array(15)].forEach((_, v) => {
    items.push({
      type: "rect",
      color: "#ffd5d5",
      width: 20,
      height: 100,
      x: 700 + 40 * v,
      y: 2450,
    });
  });

  items.push({
    type: "image",
    content: "/games/settlers/rogue.png",
    x: 100,
    y: 2700,
  });

  return {
    items,
    board: { size: 4000, scale: 0.5 },
  };
};

const game = genGame();

export default game;
