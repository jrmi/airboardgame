import { urlAlphabet } from 'nanoid';

const genTikTok = () => {
  const items = [];

  items.push({
    type: 'image',
    content: '/games/tiktok.svg',
    locked: true,
    x: 100,
    y: 100,
  });

  items.push({
    type: 'rect',
    color: '#00D022',
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  });

  items.push({
    type: 'rect',
    color: '#00D022',
    width: 80,
    height: 80,
    x: 15,
    y: 12,
  });

  items.push({
    type: 'rect',
    color: '#00D022',
    width: 80,
    height: 80,
    x: 20,
    y: 14,
  });

  items.push({
    type: 'rect',
    color: '#00D022',
    width: 80,
    height: 80,
    x: 25,
    y: 16,
  });

  items.push({
    type: 'rect',
    color: '#00D022',
    width: 80,
    height: 80,
    x: 30,
    y: 18,
  });

  items.push({
    type: 'rect',
    color: '#00D022',
    width: 80,
    height: 80,
    x: 35,
    y: 20,
  });

  // Red player

  items.push({
    type: 'round',
    color: '#D00022',
    radius: 80,
    x: 1010,
    y: 1050,
  });

  items.push({
    type: 'round',
    color: '#D00022',
    radius: 80,
    x: 1015,
    y: 1052,
  });

  items.push({
    type: 'round',
    color: '#D00022',
    radius: 80,
    x: 1020,
    y: 1054,
  });

  items.push({
    type: 'round',
    color: '#D00022',
    radius: 80,
    x: 1025,
    y: 1056,
  });

  items.push({
    type: 'round',
    color: '#D00022',
    radius: 80,
    x: 1030,
    y: 1058,
  });

  items.push({
    type: 'round',
    color: '#D00022',
    radius: 80,
    x: 1035,
    y: 1060,
  });

  return {
    items,
    board: { size: 1200, scale: 0.5 },
  };
};

export const tiktok = genTikTok();

export default tiktok;
