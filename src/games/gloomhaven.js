const genGloomhaven = () => {
  const items = [];

  items.push({
    type: "image",
    content: "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/map-tiles/l1a.png",
    backContent: "/games/back.jpg",
    width: 100,
    flipped: false,
    rotation: '90deg',
    x: 100,
    y: 100,
  });

  items.push({
    type: "image",
    content: "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/map-tiles/g1b.png",
    backContent: "/games/back.jpg",
    width: 100,
    flipped: false,
    rotation: '270deg',
    x: 100,
    y: 100,
  });

  items.push({
    type: "image",
    content: "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/map-tiles/i1b.png",
    backContent: "/games/back.jpg",
    width: 100,
    flipped: false,
    rotation: '90deg',
    x: 100,
    y: 100,
  });

  return {
    items,
    board: { size: 1000, scale: 0.5 },
  };
};

export const game = genGloomhaven();

export default game;
