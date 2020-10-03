console.log("Save game");

const throwError = (message, code = 400) => {
  const errorObject = new Error(message);
  errorObject.statusCode = code;
  throw errorObject;
};

const main = async ({ store, id, userId, body }) => {
  let existingGame = null;

  try {
    existingGame = await store.get("game", id);
  } catch {
    console.log("Game not found");
  }

  if (existingGame && existingGame.owner !== userId) {
    console.log("fobidden");
    throwError("Modification allowed only for owner", 403);
  }

  let { owner = userId } = body;
  const result = await store.save("game", id, { ...body, owner });
  return result;
};
