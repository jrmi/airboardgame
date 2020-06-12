const genGloomhaven = () => {
  const items = [];

  items.push({
    type: 'image',
    content:
      'https://raw.githubusercontent.com/romgar/gloomhaven/master/images/map-tiles/l1a.png',
    x: 830,
    y: 408,
    rotation: '90',
  });

  items.push({
    type: 'image',
    content:
      'https://raw.githubusercontent.com/romgar/gloomhaven/master/images/map-tiles/g1b.png',
    x: 768,
    y: 134,
    rotation: '270',
  });

  items.push({
    type: 'image',
    content:
      'https://raw.githubusercontent.com/romgar/gloomhaven/master/images/map-tiles/i1b.png',
    x: 558,
    y: 80,
    rotation: '90',
  });

  return {
    items,
    board: { size: 2000, scale: 0.5 },
  };
};

export const game = genGloomhaven();

export default game;
