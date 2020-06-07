import { urlAlphabet } from 'nanoid';

const genTikTok = () => {
  const items = [];

  items.push({
    color: '#00D022',
    width: 30,
    height: 30,
    x: 10,
    y: 10,
  });

  items.push({
    color: '#00D022',
    width: 30,
    height: 30,
    x: 15,
    y: 12,
  });

  items.push({
    color: '#00D022',
    width: 30,
    height: 30,
    x: 20,
    y: 14,
  });

  items.push({
    color: '#00D022',
    width: 30,
    height: 30,
    x: 25,
    y: 16,
  });

  items.push({
    color: '#00D022',
    width: 30,
    height: 30,
    x: 30,
    y: 18,
  });

  items.push({
    color: '#00D022',
    width: 30,
    height: 30,
    x: 35,
    y: 20,
  });

  // Red player

  items.push({
    color: '#D00022',
    width: 30,
    height: 30,
    x: 10,
    y: 50,
  });

  items.push({
    color: '#D00022',
    width: 30,
    height: 30,
    x: 15,
    y: 52,
  });

  items.push({
    color: '#D00022',
    width: 30,
    height: 30,
    x: 20,
    y: 54,
  });

  items.push({
    color: '#D00022',
    width: 30,
    height: 30,
    x: 25,
    y: 56,
  });

  items.push({
    color: '#D00022',
    width: 30,
    height: 30,
    x: 30,
    y: 58,
  });

  items.push({
    color: '#D00022',
    width: 30,
    height: 30,
    x: 35,
    y: 60,
  });

  return { items, background: '/tiktok.svg' };
};

export const tiktok = genTikTok();

export default tiktok;
