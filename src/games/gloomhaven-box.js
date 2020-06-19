const genGloomhavenBox = () => {
  const items = [];

  // map-tiles

  Array.from("abcdefghijkl").forEach((l) => {
    items.push({
      type: "image",
      content: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/map-tiles/${l}1a.png`,
      backContent: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/map-tiles/${l}1b.png`,
      text: `${l}1a`,
      backText: `${l}1b`,
      label: `Tiles ${l}1a / ${l}1b`,
      groupId: "map-tiles",
    });
    items.push({
      type: "image",
      content: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/map-tiles/${l}2a.png`,
      backContent: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/map-tiles/${l}2b.png`,
      text: `${l}2a`,
      backText: `${l}2b`,
      label: `Tiles ${l}2a / ${l}2b`,
      groupId: "map-tiles",
    });
  });

  // character-mats

  items.push({
    type: "image",
    content:
      "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/character-mats/brute.png",
    backContent:
      "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/character-mats/brute-back.png",
    width: 300,
    label: "Brute mat-board",
    groupId: "characters",
  });

  items.push({
    type: "image",
    content:
      "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/character-mats/spellweaver.png",
    backContent:
      "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/character-mats/spellweaver-back.png",
    width: 300,
    label: "Spellweaver mat-board",
    groupId: "characters",
  });

  items.push({
    type: "image",
    content:
      "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/character-perks/brute-perks.png",
    width: 300,
    label: "Brute perks-board",
    groupId: "characters",
  });

  items.push({
    type: "image",
    content:
      "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/character-perks/spellweaver-perks.png",
    width: 300,
    label: "Spellweaver perks-board",
    groupId: "characters",
  });

  // Attack modifiers

  [...Array(19).keys()].forEach((_, index) => {
    const number = index < 9 ? "0" + (index + 1) : "" + (index + 1);
    items.push({
      type: "image",
      content: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/attack-modifiers/base/player/am-p-${number}.png`,
      backContent: "/games/gloom/attackback.png",
      width: 100,
      flipped: true,
      label: `Player Attack modifier am-p-${number}`,
      groupId: "attack-modifiers",
    });
  });

  [...Array(19).keys()].forEach((_, index) => {
    const number = index < 9 ? "0" + (index + 1) : "" + (index + 1);
    items.push({
      type: "image",
      content: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/attack-modifiers/base/monster/am-m-${number}.png`,
      backContent: "/games/gloom/attackback.png",
      width: 100,
      flipped: true,
      label: `Monster Attack modifier am-p-${number}`,
      groupId: "attack-modifiers",
    });
  });

  // monster tokens
  items.push({
    type: "image",
    content:
      "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/monster-tokens/bandit-guard.png",
    width: 60,
    text: "X",
    overlay: {
      content:
        "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/monster-tokens/normal-monster-overlay.svg",
    },
    label: "Bandit guard normal",
    groupId: "monster-tokens",
  });
  items.push({
    type: "image",
    content:
      "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/monster-tokens/bandit-guard.png",
    width: 60,
    text: "X",
    overlay: {
      content:
        "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/monster-tokens/elite-monster-overlay.svg",
    },
    label: "Bandit guard elite",
    groupId: "monster-tokens",
  });

  items.push({
    type: "image",
    content:
      "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/monster-tokens/bandit-archer.png",
    width: 60,
    text: "X",
    overlay: {
      content: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/monster-tokens/normal-monster-overlay.svg`,
    },
    label: "Bandit archer normal",
    groupId: "monster-tokens",
  });
  items.push({
    type: "image",
    content:
      "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/monster-tokens/bandit-archer.png",
    width: 60,
    text: "X",
    overlay: {
      content: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/monster-tokens/elite-monster-overlay.svg`,
    },
    label: "Bandit archer elite",
    groupId: "monster-tokens",
  });

  items.push({
    type: "image",
    content:
      "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/monster-tokens/living-bones.png",
    width: 60,
    text: "X",
    overlay: {
      content: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/monster-tokens/normal-monster-overlay.svg`,
    },
    label: "Living bones normal",
    groupId: "monster-tokens",
  });
  items.push({
    type: "image",
    content:
      "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/monster-tokens/living-bones.png",
    width: 60,
    text: "X",
    overlay: {
      content: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/monster-tokens/elite-monster-overlay.svg`,
    },
    label: "Living bones elite",
    groupId: "monster-tokens",
  });

  const monsters = ["bandit-guard", "bandit-archer", "living-bones"];
  monsters.forEach((monsterName) => {
    items.push({
      type: "image",
      content: `https://raw.githubusercontent.com//romgar/gloomhaven/master/images/monster-stat-cards/${monsterName}-0.png`,
      width: 200,
      label: `${monsterName}`,
      groupId: `monster-stats-cards`,
    });
  });

  // Overlay tokens
  items.push({
    type: "image",
    content:
      "https://raw.githubusercontent.com//romgar/gloomhaven/master/images/overlay-tokens/treasures/coin-1.png",
    width: 50,
    label: "Coin 1",
    groupId: "treasures",
  });

  items.push({
    type: "image",
    content:
      "https://raw.githubusercontent.com//romgar/gloomhaven/master/images/overlay-tokens/treasures/treasure.png",
    width: 50,
    label: "Treasure",
    groupId: "treasures",
  });

  items.push({
    type: "counter",
    value: 0,
    width: 50,
    label: "Life counter",
    groupId: "counters",
  });

  items.push({
    type: "image",
    content:
      "https://raw.githubusercontent.com//romgar/gloomhaven/master/images/overlay-tokens/doors/stone-door.png",
    width: 50,
    label: "Stone door",
    groupId: "doors",
  });

  items.push({
    type: "image",
    content:
      "https://raw.githubusercontent.com//romgar/gloomhaven/master/images/overlay-tokens/traps/spike-pit-trap.png",
    width: 50,
    label: "Spike pit trap",
    groupId: "traps",
  });

  items.push({
    type: "image",
    content:
      "https://raw.githubusercontent.com//romgar/gloomhaven/master/images/overlay-tokens/obstacles/table.png",
    width: 50,
    label: "Table",
    groupId: "obstacles",
  });

  // Character ability cards
  const brute = {
    code: "BR",
    abilityCards: {
      "level-1": [
        "eye-for-an-eye",
        "grab-and-go",
        "leaping-cleave",
        "overwhelming-assault",
        "provoking-roar",
        "shield-bash",
        "spare-dagger",
        "sweeping-blow",
        "trample",
        "warding-strength",
      ],
      "level-X": ["balanced-measure", "skewer", "wall-of-doom"],
      "level-2": ["fatal-advance", "juggernaut"],
      "level-3": ["brute-force", "hook-and-chain"],
      "level-4": ["devastating-hack", "unstoppable-charge"],
      "level-5": ["skirmishing-maneuver", "whirlwind"],
      "level-6": ["immovable-phalanx", "quietus"],
      "level-7": ["crippling-offensive", "defensive-tactics"],
      "level-8": ["frenzied-onslaught", "selfish-retribution"],
      "level-9": ["face-your-end", "king-of-the-hill"],
    },
    backCard:
      "https://raw.githubusercontent.com//romgar/gloomhaven/master/images/character-ability-cards/BR/br-back.png",
    icon:
      "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/character-icons/brute-icon.png",
    token:
      "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/character-icons/brute-character-token.png",
  };

  brute.abilityCards["level-1"].forEach((abilityName) => {
    items.push({
      type: "image",
      content: `https://raw.githubusercontent.com//romgar/gloomhaven/master/images/character-ability-cards/${brute.code}/${abilityName}.png`,
      backContent: `${brute.backCard}`,
      width: 100,
      label: `Level 1 card: ${abilityName}`,
      groupId: "brute",
    });
  });

  items.push({
    type: "image",
    content: brute.icon,
    width: 40,
    label: "Brute icon",
    groupId: "brute",
  });

  items.push({
    type: "image",
    content: brute.token,
    width: 20,
    label: "Brute token",
    groupId: "brute",
  });

  const spellWeaver = {
    code: "SW",
    abilityCards: {
      "level-1": [
        "fire-orbs",
        "flame-strike",
        "freezing-nova",
        "frost-armor",
        "impaling-eruption",
        "mana-bolt",
        "reviving-ether",
        "ride-the-wind",
      ],
      "level-X": ["crackling-air", "hardened-spikes", "aid-from-the-ether"],
      "level-2": ["flashing-burst", "icy-blast"],
      "level-3": ["elemental-aid", "cold-fire"],
      "level-4": ["forked-beam", "spirit-of-doom"],
      "level-5": ["engulfed-in-flames", "chromatic-explosion"],
      "level-6": ["frozen-night", "living-torch"],
      "level-7": ["stone-fists", "twin-restoration"],
      "level-8": ["zephyr-wings", "cold-front"],
      "level-9": ["inferno", "black-hole"],
    },
    backCard:
      "https://raw.githubusercontent.com//romgar/gloomhaven/master/images/character-ability-cards/SW/sw-back.png",
    icon:
      "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/character-icons/spellweaver-icon.png",
    token:
      "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/character-icons/spellweaver-character-token.png",
  };

  spellWeaver.abilityCards["level-1"].forEach((abilityName) => {
    items.push({
      type: "image",
      content: `https://raw.githubusercontent.com//romgar/gloomhaven/master/images/character-ability-cards/${spellWeaver.code}/${abilityName}.png`,
      backContent: `${spellWeaver.backCard}`,
      width: 100,
      label: `Level 1 card: ${abilityName}`,
      groupId: "spellweaver",
    });
  });

  items.push({
    type: "image",
    content: spellWeaver.icon,
    width: 40,
    label: "Spellweaver icon",
    groupId: "spellweaver",
  });

  items.push({
    type: "image",
    content: spellWeaver.token,
    width: 20,
    label: "Spellweaver token",
    groupId: "spellweaver",
  });

  const elements = ["ice", "air", "earth", "fire", "dark", "light"];
  elements.forEach((elementName) => {
    items.push({
      type: "image",
      content: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/elements/${elementName}-element.svg`,
      width: 30,
      label: `Element ${elementName}`,
      groupId: "elements",
    });
  });

  items.push({
    type: "image",
    content:
      "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/elements/element-matboard.png",
    width: 300,
    label: "Element matboard",
    groupId: "elements",
  });

  const ailments = [
    "reinforcement",
    "disarm",
    "immobilise",
    "wound",
    "stun",
    "invisible",
    "confusion",
    "poison",
  ];
  ailments.forEach((ailmentName) => {
    items.push({
      type: "image",
      content: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/ailments/${ailmentName}.png`,
      width: 30,
      label: `${ailmentName} icon`,
      groupId: "ailments",
    });
  });

  const battleGoals = [
    "aggressor",
    "diehard",
    "dynamo",
    "executioner",
    "explorer",
    "fasthealer",
    "hoarder",
    "hunter",
    "indigent",
    "layabout",
    "masochist",
    "neutralizer",
    "opener",
    "pacifist",
    "plunderer",
    "professional",
    "protector",
    "purist",
    "sadist",
    "scrambler",
    "straggler",
    "streamliner",
    "workhorse",
    "zealot",
  ];
  battleGoals.forEach((battleGoalName) => {
    items.push({
      type: "image",
      content: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/battle-goals/${battleGoalName}.png`,
      backContent:
        "https://raw.githubusercontent.com/romgar/gloomhaven/master/images/battle-goals/battlegoal-back.png",
      flipped: true,
      width: 30,
      label: `${battleGoalName}`,
      groupId: "battle-goals",
    });
  });

  const characterItems = [
    "boots-of-striding",
    "cloak-of-invisibility",
    "eagle-eye-goggles",
    "heater-shield",
    "hide-armor",
    "iron-helmet",
    "leather-armor",
    "minor-healing-potion",
    "minor-power-potion",
    "minor-stamina-potion",
    "piercing-bow",
    "poison-dagger",
    "war-hammer",
    "winged-shoes",
  ];
  characterItems.forEach((itemName) => {
    items.push({
      type: "image",
      content: `https://raw.githubusercontent.com/romgar/gloomhaven/master/images/items/1-14/${itemName}.png`,
      flipped: true,
      width: 40,
      label: `${itemName}`,
      groupId: "items 1-14",
    });
  });

  return {
    items,
    board: { size: 3000, scale: 0.5 },
  };
};

export const gameBox = genGloomhavenBox();

export default gameBox;
