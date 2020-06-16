const genGloomhaven = () => {
  const items = [];

  // map-tiles

  Array.from('abcdefghijkl').forEach((l, index) => {
    items.push({
      type: 'image',
      content: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/map-tiles/${l}1a.png`,
      backContent: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/map-tiles/${l}1b.png`,
      text: `${l}1a`,
      backText: `${l}1b`,
      x: 558,
      y: 80,
    });
    items.push({
      type: 'image',
      content: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/map-tiles/${l}2a.png`,
      backContent: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/map-tiles/${l}2b.png`,
      text: `${l}2a`,
      backText: `${l}2b`,
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

  // monster tokens
  [...Array(10).keys()].forEach((_, index) => {
    items.push({
      type: 'image',
      content:
        'https://raw.githubusercontent.com//romgar/gloomhaven/master/images/monster-tokens/bandit-guard.png',
      x: 1500 + 50 * index,
      y: 0,
      width: 50,
      text: `${index}`,
      extraStyle: {
        border: `2px solid ${index < 7 ? 'white' : 'yellow'}`,
      },
    });
    items.push({
      type: 'image',
      content:
        'https://raw.githubusercontent.com//romgar/gloomhaven/master/images/monster-tokens/bandit-archer.png',
      x: 1500 + 50 * index,
      y: 50,
      width: 50,
      text: `${index}`,
      extraStyle: {
        border: `2px solid ${index < 7 ? 'white' : 'yellow'}`,
      },
    });
    items.push({
      type: 'image',
      content:
        'https://raw.githubusercontent.com//romgar/gloomhaven/master/images/monster-tokens/living-bones.png',
      x: 1500 + 50 * index,
      y: 100,
      width: 50,
      text: `${index}`,
      extraStyle: {
        border: `2px solid ${index < 7 ? 'white' : 'yellow'}`,
      },
    });
  });

  // Overlay tokens
  [...Array(20).keys()].forEach((_, index) => {
    items.push({
      type: 'image',
      content:
        'https://raw.githubusercontent.com//romgar/gloomhaven/master/images/overlay-tokens/treasures/coin-1.png',
      x: 1100 + 20 * index,
      y: 200,
      width: 50,
    });
  });

  items.push({
    type: 'counter',
    label: 'Life #1',
    value: 0,
    x: 100,
    y: 100,
    width: 50,
  });

  items.push({
    type: 'counter',
    label: 'Life #2',
    value: 0,
    x: 100,
    y: 300,
    width: 50,
  });

  items.push({
    type: 'counter',
    label: 'XP #1',
    value: 0,
    x: 300,
    y: 100,
    width: 50,
  });

  items.push({
    type: 'counter',
    label: 'XP #2',
    value: 0,
    x: 300,
    y: 300,
    width: 50,
  });

  items.push({
    type: 'counter',
    label: 'Gold #1',
    value: 0,
    x: 100,
    y: 600,
    width: 50,
  });

  items.push({
    type: 'counter',
    label: 'Gold #2',
    value: 0,
    x: 100,
    y: 900,
    width: 50,
  });

  items.push({
    type: 'image',
    content:
      'https://raw.githubusercontent.com//romgar/gloomhaven/master/images/overlay-tokens/treasures/treasure.png',
    x: 1100,
    y: 250,
    width: 50,
  });

  [...Array(2).keys()].forEach((_, index) => {
    items.push({
      type: 'image',
      content:
        'https://raw.githubusercontent.com//romgar/gloomhaven/master/images/overlay-tokens/doors/stone-door.png',
      x: 1100 + 20 * index,
      y: 300,
      width: 50,
    });
  });

  [...Array(2).keys()].forEach((_, index) => {
    items.push({
      type: 'image',
      content:
        'https://raw.githubusercontent.com//romgar/gloomhaven/master/images/overlay-tokens/traps/spike-pit-trap.png',
      x: 1100 + 20 * index,
      y: 350,
      width: 50,
    });
  });

  [...Array(2).keys()].forEach((_, index) => {
    items.push({
      type: 'image',
      content:
        'https://raw.githubusercontent.com//romgar/gloomhaven/master/images/overlay-tokens/obstacles/table.png',
      x: 1100 + 20 * index,
      y: 400,
      width: 50,
    });
  });

  // Character ability cards
  const brute = {
    code: 'BR',
    abilityCards: {
      'level-1': [
        'eye-for-an-eye',
        'grab-and-go',
        'leaping-cleave',
        'overwhelming-assault',
        'provoking-roar',
        'shield-bash',
        'spare-dagger',
        'sweeping-blow',
        'trample',
        'warding-strength',
      ],
      'level-X': ['balanced-measure', 'skewer', 'wall-of-doom'],
      'level-2': ['fatal-advance', 'juggernaut'],
      'level-3': ['brute-force', 'hook-and-chain'],
      'level-4': ['devastating-hack', 'unstoppable-charge'],
      'level-5': ['skirmishing-maneuver', 'whirlwind'],
      'level-6': ['immovable-phalanx', 'quietus'],
      'level-7': ['crippling-offensive', 'defensive-tactics'],
      'level-8': ['frenzied-onslaught', 'selfish-retribution'],
      'level-9': ['face-your-end', 'king-of-the-hill'],
    },
    backCard:
      'https://raw.githubusercontent.com//romgar/gloomhaven/master/images/character-ability-cards/BR/br-back.png',
  };

  brute.abilityCards['level-1'].forEach((abilityName, index) => {
    items.push({
      type: 'image',
      content: `https://raw.githubusercontent.com//romgar/gloomhaven/master/images/character-ability-cards/${brute.code}/${abilityName}.png`,
      backContent: `${brute.backCard}`,
      x: 0 + 70 * index,
      y: 1000,
      width: 70,
    });
  });

  const spellWeaver = {
    code: 'SW',
    abilityCards: {
      'level-1': [
        'fire-orbs',
        'flame-strike',
        'freezing-nova',
        'frost-armor',
        'impaling-eruption',
        'mana-bolt',
        'reviving-ether',
        'ride-the-wind',
      ],
      'level-X': ['crackling-air', 'hardened-spikes', 'aid-from-the-ether'],
      'level-2': ['flashing-burst', 'icy-blast'],
      'level-3': ['elemental-aid', 'cold-fire'],
      'level-4': ['forked-beam', 'spirit-of-doom'],
      'level-5': ['engulfed-in-flames', 'chromatic-explosion'],
      'level-6': ['frozen-night', 'living-torch'],
      'level-7': ['stone-fists', 'twin-restoration'],
      'level-8': ['zephyr-wings', 'cold-front'],
      'level-9': ['inferno', 'black-hole'],
    },
    backCard:
      'https://raw.githubusercontent.com//romgar/gloomhaven/master/images/character-ability-cards/SW/sw-back.png',
  };

  spellWeaver.abilityCards['level-1'].forEach((abilityName, index) => {
    items.push({
      type: 'image',
      content: `https://raw.githubusercontent.com//romgar/gloomhaven/master/images/character-ability-cards/${spellWeaver.code}/${abilityName}.png`,
      backContent: `${spellWeaver.backCard}`,
      x: 0 + 70 * index,
      y: 1150,
      width: 70,
    });
  });

  return {
    items,
    board: { size: 2000, scale: 0.5 },
  };
};

export const game = genGloomhaven();

export default game;
