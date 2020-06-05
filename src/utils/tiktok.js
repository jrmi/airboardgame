const genTikTok = () => {
  const items = [];

  items.push({
    default: {
      color: '#00D022',
      width: 30,
      height: 30,
      x: 10,
      y: 10,
    },
  });

  items.push({
    default: {
      color: '#00D022',
      width: 30,
      height: 30,
      x: 50,
      y: 10,
    },
  });

  items.push({
    default: {
      color: '#00D022',
      width: 30,
      height: 30,
      x: 100,
      y: 10,
    },
  });

  items.push({
    default: {
      color: '#D00022',
      width: 30,
      height: 30,
      x: 10,
      y: 50,
    },
  });

  items.push({
    default: {
      color: '#D00022',
      width: 30,
      height: 30,
      x: 50,
      y: 50,
    },
  });

  items.push({
    default: {
      color: '#D00022',
      width: 30,
      height: 30,
      x: 100,
      y: 50,
    },
  });
  return { items };
};

export const tiktok = genTikTok();

export default tiktok;
