import { nanoid } from "nanoid";

const genGame = () => {
  const items = [...Array(2000)].map((e, index) => ({
    type: "rect",
    x: 10 + index,
    y: 10 + index,
    width: 100,
    height: 100,
    id: nanoid(),
  }));
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
      size: 4000,
      scale: 0.5,
      name: "Unpublished Game",
      published: false,
      translations: [
        {
          language: "fr",
          name: "2 Jeu non-publie",
          description: "Un jeu non-publie pour tester",
        },
      ],
      playerCount: [1, 9],
      defaultName: "2 Unpublished Game",
      defaultLanguage: "en",
      defaultDescription: "A non-published game",
      materialLanguage: "Multi-lang",
      minAge: "10",
      duration: [30, 90],
      imageUrl: "/game_assets/testgame.png",
      gridSize: 1,
    },
  };
};

export const unpublishedGame = genGame();

export default unpublishedGame;
