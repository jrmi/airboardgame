import { throwError } from "./utils";

export const ownerOrNewHooks = async (context) => {
  let existingGame = null;

  const { userId, store, resourceId, body, boxId, method } = context;

  // Is it the `game` box ?
  if (boxId !== "game") {
    return context;
  }

  // Is it a modification action ?
  if (!["POST", "UPDATE", "DELETE"].includes(method)) {
    return context;
  }

  // It a game modification...

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
};

export const onlySelfOrPublicGames = async (context) => {
  const { boxId, userId } = context;
  if (boxId !== "game") {
    return context;
  }
  const newContext = { ...context };
  console.log(newContext.response[0]);
  newContext.response = context.response.filter(
    ({ board: { published }, owner }) => published || owner === userId
  );
  return newContext;
};
