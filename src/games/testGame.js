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
    actions: ["rotate90", "rotate45"],
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
    board: { size: 1000, scale: 1 },
  };
};

export const testGame = genGame();

export default testGame;
