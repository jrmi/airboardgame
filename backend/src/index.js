import saveGame from "./saveGame";
import deleteGame from "./deleteGame";

const replaceImageUrl = async ({ store }) => {
  console.log("Migrate images...");

  (await store.list("game")).forEach((game) => {
    if (!Array.isArray(game.board.migrations)) {
      game.board.migrations = [];
    }

    const migrations = new Set(game.board.migrations);

    const from = "public.jeremiez.net/airboardgame/";
    const to = "public.jeremiez.net/ricochet/";

    if (migrations.has("migrate_image_url")) {
      return;
    }
    game.items = game.items.map((item) => {
      if (item.type === "image") {
        const newItem = { ...item };
        if (newItem.content && newItem.content.includes(from)) {
          newItem.content = newItem.content.replace(from, to);
        }
        if (
          newItem.overlay &&
          newItem.overlay.content &&
          newItem.overlay.content.includes(from)
        ) {
          newItem.overlay = newItem.overlay.replace(from, to);
        }
        if (newItem.backContent && newItem.backContent.includes(from)) {
          newItem.backContent = newItem.backContent.replace(from, to);
        }
        return newItem;
      } else {
        return item;
      }
    });

    if (game.board.imageUrl && game.board.imageUrl.includes(from)) {
      game.board.imageUrl = game.board.imageUrl.replace(from, to);
    }

    migrations.add("migrate_image_url");
    game.board.migrations = Array.from(migrations);

    store.update("game", game._id, game);
  });
};

export const main = async ({ store, functions, schedules }) => {
  // Add remote functions
  functions.saveGame = saveGame;
  functions.deleteGame = deleteGame;
  functions.test = ({ store }) => {
    console.log("Test function call is a success", store);
  };

  // Declare stores
  await store.createOrUpdateBox("game", { security: "readOnly" });
  await store.createOrUpdateBox("session", { security: "public" });

  // Add schedules
  schedules["daily"] = [
    async () => {
      const sessions = await store.list("session", { limit: 10000 });
      sessions.forEach(async (session) => {
        const now = Date.now();
        if (!session.timestamp) {
          console.log("Delete session without timestamp ", session._id);
          await store.delete("session", session._id);
        }
        if (now - session.timestamp > 30 * 24 * 60 * 60 * 100) {
          console.log("Delete too old session ", session._id);
          await store.delete("session", session._id);
        }
      });
    },
  ];

  await replaceImageUrl({ store });

  console.log("Setup loaded with session");
};

export default main;
