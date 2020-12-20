const genGame = () => {
  const items = [];

  items.push({
    type: "image",
    content: "/games/AS.jpg",
    backContent: "/games/Red_back.jpg",
    text: "frontLabel",
    width: 100,
    x: 400,
    y: 400,
    actions: [
      "flip",
      "flipSelf",
      "tap",
      "rotate45",
      "rotate90",
      "stack",
      "shuffle",
      "clone",
      "lock",
      "remove",
    ],
  });

  items.push({
    type: "image",
    content: "/games/BH.jpg",
    backContent: "/games/Red_back.jpg",
    text: "frontLabel",
    backText: "backLabel",
    width: 100,
    x: 410,
    y: 400,
  });

  items.push({
    type: "image",
    content: "/games/JC.jpg",
    backContent: "/games/Red_back.jpg",
    overlay: { content: "/games/overlay.png" },
    width: 100,
    x: 420,
    y: 400,
  });

  items.push({
    type: "rect",
    color: "#00D022",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });

  items.push({
    type: "rect",
    color: "#22D022",
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
    label: "Counter",
    type: "counter",
    color: "#D00022",
    x: 50,
    y: 50,
  });

  items.push({
    label: "Dice",
    type: "dice",
    color: "#D00022",
    x: 200,
    y: 50,
  });

  items.push({
    label: "Note",
    type: "note",
    color: "#ffc",
    x: 200,
    y: 200,
  });

  items.push({
    label: "My zone",
    type: "zone",
    layer: -1,
    width: 500,
    height: 300,
    locked: true,
    x: 200,
    y: 600,
  });
  items.push({
    label: "My cube",
    type: "cube",
    size: 70,
    color: "#ff0000",
    x: 400,
    y: 550,
  });
  items.push({
    label: "My token",
    type: "token",
    size: 70,
    color: "#00ff00",
    x: 450,
    y: 600,
  });
  items.push({
    label: "My meeple",
    type: "meeple",
    size: 70,
    color: "#0000ff",
    x: 600,
    y: 650,
  });
  items.push({
    label: "My jewel",
    type: "jewel",
    size: 70,
    color: "#00ffff",
    x: 650,
    y: 550,
  });
  items.push({
    label: "My jewel",
    type: "jewel",
    size: 70,
    color: "#ff0000",
    x: 650,
    y: 600,
  });

  return {
    items,
    availableItems: [
      {
        groupId: "Group",
        label: "Rect",
        type: "rect",
        color: "#00D022",
        width: 80,
        height: 80,
      },
    ],
    board: {
      size: 1000,
      scale: 1,
      name: "Test Game",
      published: true,
      translations: [
        {
          language: "fr",
          name: "0 Jeu test",
          description: "Un jeu pour tester",
        },
      ],
      playerCount: [2, 4],
      defaultName: "0 Test game",
      defaultLanguage: "en",
      defaultDescription: "A classic",
      materialLanguage: "Multi-lang",
      minAge: "10",
      duration: [30, 90],
      imageUrl: "/games/testgame.png",
      gridSize: 1,
    },
  };
};

export const testGame = genGame();

export default testGame;
