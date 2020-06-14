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

  // map-tiles

  Array.from('abcdefghijkl').forEach((l, index) => {
    items.push({
      type: 'image',
      content: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/map-tiles/${l}1a.png`,
      backContent: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/map-tiles/${l}1b.png`,
      x: 558,
      y: 80,
    });
    items.push({
      type: 'image',
      content: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/map-tiles/${l}2a.png`,
      backContent: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/map-tiles/${l}2b.png`,
      x: 558,
      y: 80,
    });
  });

  // character-mats

  items.push({
    type: 'image',
    content:
      'https://raw.githubusercontent.com/romgar/gloomhaven/master/images/character-mats/tinkerer.png',
    backContent:
      'https://raw.githubusercontent.com/romgar/gloomhaven/master/images/character-mats/tinkerer-back.png',
    width: 300,
    x: 300,
    y: 300,
  });

  // Attack modifiers

  [...Array(19).keys()].forEach((_, index) => {
    const number = index < 9 ? '0' + (index + 1) : '' + (index + 1);
    items.push({
      type: 'image',
      content: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/attack-modifiers/base/player/am-p-${number}.png`,
      backContent: '/games/gloom/attackback.png',
      width: 100,
      flipped: true,
      x: 300,
      y: 200,
    });
  });

  [...Array(19).keys()].forEach((_, index) => {
    const number = index < 9 ? '0' + (index + 1) : '' + (index + 1);
    items.push({
      type: 'image',
      content: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/attack-modifiers/base/player/am-p-${number}.png`,
      backContent: '/games/gloom/attackback.png',
      width: 100,
      flipped: true,
      x: 300,
      y: 600,
    });
  });

  [...Array(19).keys()].forEach((_, index) => {
    const number = index < 9 ? '0' + (index + 1) : '' + (index + 1);
    items.push({
      type: 'image',
      content: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/attack-modifiers/base/monster/am-m-${number}.png`,
      backContent: '/games/gloom/attackback.png',
      width: 100,
      flipped: true,
      x: 1000,
      y: 300,
    });
  });

  return {
    items,
    board: { size: 2000, scale: 0.5 },
  };
};

export const game = genGloomhaven();

export default game;
