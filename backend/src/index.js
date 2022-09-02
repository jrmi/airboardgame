import {
  ownerOrAdminOrNewHooks,
  onlySelfOrPublicGames,
  onlySelfUser,
} from "./hooks.js";
import getConfToken from "./getConfToken.js";

const SESSION_DURATION = 60; // Session duration in days

export const main = async ({ store, schedules, hooks, functions }) => {
  hooks.before = [ownerOrAdminOrNewHooks, onlySelfUser];
  hooks.after = [ownerOrAdminOrNewHooks, onlySelfOrPublicGames];
  hooks.beforeFile = [ownerOrAdminOrNewHooks];

  functions.getConfToken = getConfToken;

  // Declare stores
  await store.createOrUpdateBox("game", { security: "readOnly" });
  await store.createOrUpdateBox("room", { security: "public" });
  await store.createOrUpdateBox("session", { security: "public" });
  await store.createOrUpdateBox("user", { security: "private" });

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
        if (now - session.timestamp > SESSION_DURATION * 24 * 60 * 60 * 1000) {
          console.log("Delete too old session ", session._id);
          await store.delete("session", session._id);
        }
      });
    },
  ];

  //await replaceImageUrl({ store });

  console.log("Setup loaded with session");
};

export default main;
