import { throwError } from "./utils";

export const ownerOrNewHooks = async (context) => {
  let existingGame = null;

  const { userId, store, resourceId, body, boxId, method } = context;
  if (boxId === "game" && ["POST", "UPDATE", "DELETE"].includes(method)) {
    if (!userId) {
      throwError(
        "Game creation/modification not allowed for unauthenticated users",
        403
      );
    }

    const nextContext = {
      ...context,
      allow: true,
      body: { ...body, owner: userId },
    };

    if (!resourceId) {
      // Creation
      return nextContext;
    }

    try {
      existingGame = await store.get("game", resourceId);
    } catch {
      console.log("Game not found");
      // Creation but with resourceId
      return nextContext;
    }

    if (existingGame.owner !== userId) {
      // Update with bad user
      throwError("Modification allowed only for owner", 403);
    }
    // Update with good user (and force user)
    return nextContext;
  } else {
    // No changes
    return context;
  }
};
