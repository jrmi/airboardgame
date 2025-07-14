import PocketBase from "pocketbase";
import { API_ENDPOINT, IS_PRODUCTION } from "./settings";

import testGame from "../games/testGame";
import perfGame from "../games/perfGame";
import unpublishedGame from "../games/unpublishedGame";
import { uid } from "./";

const pb = new PocketBase(API_ENDPOINT);

// Media

export const _uploadResourceImage = async (boxId, resourceId, file) => {
  console.log("upload", boxId, resourceId);
  let collection;
  switch (boxId) {
    case "session":
      collection = "session";
      break;
    case "game":
      collection = "games";
  }
  const result = await pb
    .collection(collection)
    .update(resourceId, { "files+": file });
  const last = result.files.at(-1);

  return `api/files/${collection}/${resourceId}/${last}`;
};

export const uploadResourceImage = async (boxId, resourceId, file) => {
  console.log("upload", boxId, resourceId);
  let collection;
  switch (boxId) {
    case "session":
      collection = "sessionFiles";
      break;
    case "game":
      collection = "gameFiles";
  }

  const result = await pb
    .collection(collection)
    .create({ [boxId]: resourceId, file: file });

  return `api/files/${collection}/${result.id}/${result.file}`;
};

export const listResourceImage = async (boxId, resourceId) => {
  let collection;
  switch (boxId) {
    case "session":
      collection = "sessionFiles";
      break;
    case "game":
      collection = "gameFiles";
  }

  const files = await pb.collection(collection).getFullList({
    filter: `${boxId}='${resourceId}'`,
  });

  return files.map(({ id, file }) => `api/files/${collection}/${id}/${file}`);
};

export const deleteResourceImage = async (boxId, ressourceId, filePath) => {
  let collection;
  switch (boxId) {
    case "session":
      collection = "sessions";
      break;
    case "game":
      collection = "games";
  }

  const file = filePath.split("/").at(-1);

  const result = await pb
    .collection(collection)
    .update(ressourceId, { "files-": file });

  return result;
};

export const getBestTranslationFromConfig = (
  {
    translations = [],
    defaultLanguage,
    defaultName,
    defaultDescription,
    name,
    info,
  } = {},
  langs
) => {
  const translationsMap = {
    [defaultLanguage || "en"]: {
      name: defaultName || name,
      description: defaultDescription || info,
    },
  };

  translations.forEach((translation) => {
    translationsMap[translation.language] = translation;
  });

  for (let lang in langs) {
    if (translationsMap[langs[lang]]) {
      return translationsMap[langs[lang]];
    }
  }

  return translationsMap[defaultLanguage || "en"];
};

const demoGame = {
  id: "demo",
  owner: "nobody",
  board: {
    published: true,
    defaultName: "How to play?",
    bgType: "default",
    playerCount: [],
    duration: [],
    gridSize: 1,
    defaultLanguage: "en",
    materialLanguage: "Multi-lang",
    defaultBaseline: "Learn how to play with Airboardgame",
    imageUrl: "/game_assets/default.png",
    keepTitle: true,
    defaultDescription:
      "# Demo game\n\nThis is a demo game to learn how to play with Airboardgame.\n\nFor other games, you can find useful information about the game like the creator name or the rules.",
    translations: [
      {
        language: "fr",
        name: "Comment jouer ?",
        baseline: "Apprenez à jouer avec Airboardgame",
        description:
          "# Démonstration\n\nCe jeu vous permet d'apprendre à jouer avec Airboardgame.\n\nPour les autres jeux, vous trouverez dans cette section différentes choses utiles comme le nom de l'auteur ou les règles.",
      },
    ],
  },
};

// Games

export const getGames = async () => {
  const serverGames = await pb
    .collection("games")
    .getFullList({ fields: "id,board,owner" });

  let gameList = [];

  gameList = serverGames.map((game) => ({
    id: game.id,
    owner: game.owner,
    board: game.board,
    url: `${game.id}`, // TODO
  }));

  if (!IS_PRODUCTION || import.meta.env.VITE_CI) {
    gameList = [testGame, perfGame, unpublishedGame, ...gameList];
  }

  return [demoGame, ...gameList];
};

const fetchGame = async (gameId) => {
  const record = await pb.collection("games").getOne(gameId);

  return record;
};

const fixGame = (game) => {
  // Add id if missing
  game.items = game.items.map((item) => ({
    id: uid(),
    ...item,
  }));

  game.availableItems = game.availableItems.map((item) => ({
    id: uid(),
    ...item,
  }));
  return game;
};

export const getGame = async (gameId) => {
  let game;

  switch (gameId) {
    // Demo games
    case "test":
      game = testGame;
      break;
    case "perf":
      game = perfGame;
      break;
    case "unpublished":
      game = unpublishedGame;
      break;
    // Real games
    default:
      game = await fetchGame(gameId);
  }

  return fixGame(game);
};

export const createGame = async (data) => {
  return await pb.collection("games").create(data);
};

export const getOrCreateGame = async (gameId, defaultData) => {
  try {
    return await pb.collection("games").getOne(gameId);
  } catch (e) {
    if (e.status === 404) {
      return await pb
        .collection("games")
        .create({ id: gameId, owner: pb.authStore.record.id, ...defaultData });
    }
    throw e;
  }
};

export const updateGame = async (gameId, data) => {
  // fake games
  if (["test", "perf", "unpublished", "demo"].includes(gameId)) {
    return data;
  }
  return await pb.collection("games").update(gameId, data);
};

export const deleteGame = async (gameId) => {
  return await pb.collection("games").delete(gameId);
};

// Sessions

export const getSession = async (id) => {
  return await pb.collection("sessions").getOne(id);
};

export const createSession = async (data) => {
  return await pb.collection("sessions").create(data);
};

export const updateSession = async (id, data) => {
  return await pb.collection("sessions").update(id, data);
};

// Authentication

export const authenticate = async (email, password) => {
  pb.authStore.clear();

  const authData = await pb
    .collection("users")
    .authWithPassword(email, password);

  return authData.record;
};

export const refresh = async () => {
  pb.cancelRequest("refresh");
  await pb.collection("users").authRefresh({ requestKey: "refresh" });

  return pb.authStore.isValid;
};

export const logout = async () => {
  pb.authStore.clear();
};

export const passwordReset = async (email) => {
  await pb.collection("users").requestPasswordReset(email);
};

export const confirmPasswordReset = async (
  resetToken,
  newPassword,
  newPasswordConfirm
) => {
  await pb
    .collection("users")
    .confirmPasswordReset(resetToken, newPassword, newPasswordConfirm);
};

export const requestVerification = async (email) => {
  await pb.collection("users").requestVerification(email);
};

export const createAccount = async (email, password) => {
  console.log(email, password);
  const record = await pb.collection("users").create({
    email,
    emailVisibility: false,
    verified: true,
    name: "",
    password,
    passwordConfirm: password,
  });
  return record;
};

export const getAccount = async (id) => {
  const record = await pb.collection("users").getOne(id);
  return record;
};

// visio token
// TODO
export const getConfToken = async (session) => {
  const result = await fetch(`${execURI}/getConfToken?session=${session}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (result.status === 404) {
    throw new Error("Webconference not enabled");
  }
  if (result.status === 403) {
    throw new Error("Forbidden");
  }
  if (result.status >= 300) {
    throw new Error("Server error");
  }
  return await result.json();
};
