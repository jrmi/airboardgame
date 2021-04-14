import { replaceImageUrl } from "./migrations";
import { ownerOrNewHooks, onlySelfOrPublicGames } from "./hooks";

const SESSION_DURATION = 60; // Session duration in days

export const main = async ({ store, schedules, hooks }) => {
  hooks.before = [ownerOrNewHooks];
  hooks.after = [ownerOrNewHooks, onlySelfOrPublicGames];
  hooks.beforeFile = [ownerOrNewHooks];

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
        if (now - session.timestamp > SESSION_DURATION * 24 * 60 * 60 * 1000) {
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
