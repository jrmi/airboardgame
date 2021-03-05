const throwError = (message, code = 400) => {
  const errorObject = new Error(message);
  errorObject.statusCode = code;
  throw errorObject;
};

const main = async ({ store, id, userId }) => {
  let existingGame = null;

  if (!userId) {
    throwError("Game deletion not allowed for unauthenticated users", 403);
  }

  try {
    existingGame = await store.get("game", id);
  } catch {
    console.log("Game not found");
  }

  if (existingGame && existingGame.owner && existingGame.owner !== userId) {
    throwError("Deletion allowed only for owner", 403);
  }

  const result = await store.delete("game", id);
  return result;
};

export default main;
