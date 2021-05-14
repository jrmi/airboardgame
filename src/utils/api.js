import { API_ENDPOINT, IS_PRODUCTION, API_BASE } from "./settings";

import testGame from "../games/testGame";
import perfGame from "../games/perfGame";
import unpublishedGame from "../games/unpublishedGame";
import { nanoid } from "nanoid";

const oldUploadURI = `${API_ENDPOINT}/file`;
const gameURI = `${API_ENDPOINT}/store/game`;
const sessionURI = `${API_ENDPOINT}/store/session`;
const roomURI = `${API_ENDPOINT}/store/room`;
const execURI = `${API_ENDPOINT}/execute`;
const authURI = `${API_ENDPOINT}/auth`;

export const uploadImage = async (namespace, file) => {
  const payload = new FormData();
  payload.append("file", file);
  const result = await fetch(`${oldUploadURI}/${namespace}/`, {
    method: "POST",
    body: payload, // this sets the `Content-Type` header to `multipart/form-data`
  });

  return await result.text();
};

export const uploadResourceImage = async (boxId, resourceId, file) => {
  const uploadGameURI = `${API_ENDPOINT}/store/${boxId}/${resourceId}/file`;

  const payload = new FormData();
  payload.append("file", file);

  const result = await fetch(`${uploadGameURI}/`, {
    method: "POST",
    body: payload, // this sets the `Content-Type` header to `multipart/form-data`
    credentials: "include",
  });

  return await result.text();
};

export const listResourceImage = async (boxId, resourceId) => {
  const uploadGameURI = `${API_ENDPOINT}/store/${boxId}/${resourceId}/file`;

  const result = await fetch(`${uploadGameURI}/`, {
    method: "GET",
    credentials: "include",
  });

  return await result.json();
};

export const deleteResourceImage = async (filePath) => {
  const result = await fetch(`${API_BASE}/${filePath}`, {
    method: "DELETE",
    credentials: "include",
  });

  return await result.json();
};

export const getBestTranslationFromConfig = (
  {
    translations = [],
    defaultLanguage,
    defaultName,
    defaultDescription,
    name,
    info,
  },
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

export const getGames = async () => {
  const fetchParams = new URLSearchParams({
    fields: "_id,board,owner",
    limit: 2000,
  });

  let gameList = [];

  const result = await fetch(`${gameURI}?${"" + fetchParams}`, {
    credentials: "include",
  });

  if (result.status === 200) {
    const serverGames = await result.json();

    gameList = serverGames.map((game) => ({
      name: game.board.defaultName || game.board.name,
      id: game._id,
      owner: game.owner,
      ...game.board,
      board: game.board,
      url: `${gameURI}/${game._id}`,
    }));
  }
  if (!IS_PRODUCTION || import.meta.env.VITE_CI) {
    gameList = [
      {
        ...testGame,
        name: "Test Game",
        data: testGame,
        id: "test",
        published: true,
        ...testGame.board,
      },
      {
        ...perfGame,
        name: "Perf Test",
        data: perfGame,
        id: "perf",
        published: true,
        ...perfGame.board,
      },
      {
        ...unpublishedGame,
        name: "Unpublished Game",
        data: unpublishedGame,
        id: "unpublished",
        published: false,
        ...unpublishedGame.board,
      },
      ...gameList,
    ];
  }

  return gameList;
};

const fetchGame = async (url) => {
  const result = await fetch(url, {
    credentials: "include",
  });
  return await result.json();
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
      game = await fetchGame(`${gameURI}/${gameId}`);
  }

  // Add id if missing
  game.items = game.items.map((item) => ({
    id: nanoid(),
    ...item,
  }));

  game.availableItems = game.availableItems.map((item) => ({
    id: nanoid(),
    ...item,
  }));

  return game;
};

export const createGame = async (data) => {
  const newGameId = nanoid();
  const result = await updateGame(newGameId, data);
  return result;
};

export const updateGame = async (gameId, data) => {
  // fake games
  if (["test", "perf", "unpublished"].includes(gameId)) {
    return data;
  }
  const result = await fetch(`${gameURI}/${gameId}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (result.status === 404) {
    throw new Error("Resource not found");
  }
  if (result.status === 403) {
    throw new Error("Forbidden");
  }
  if (result.status >= 300) {
    throw new Error("Server error");
  }
  return await result.json();
};

export const deleteGame = async (gameId) => {
  const result = await fetch(`${gameURI}/${gameId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (result.status === 404) {
    throw new Error("Resource not found");
  }
  if (result.status === 403) {
    throw new Error("Forbidden");
  }
  if (result.status >= 300) {
    throw new Error("Server error");
  }
  return await result.json();
};

export const getSession = async (id) => {
  const result = await fetch(`${sessionURI}/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (result.status === 404) {
    throw new Error("Resource not found");
  }
  if (result.status === 403) {
    throw new Error("Forbidden");
  }
  if (result.status >= 300) {
    throw new Error("Server error");
  }
  return await result.json();
};

export const updateSession = async (id, data) => {
  const result = await fetch(`${sessionURI}/${id}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (result.status === 404) {
    throw new Error("Resource not found");
  }
  if (result.status === 403) {
    throw new Error("Forbidden");
  }
  if (result.status >= 300) {
    throw new Error("Server error");
  }
  return await result.json();
};

export const getRoom = async (id) => {
  const result = await fetch(`${roomURI}/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (result.status === 404) {
    throw new Error("Resource not found");
  }
  if (result.status === 403) {
    throw new Error("Forbidden");
  }
  if (result.status >= 300) {
    throw new Error("Server error");
  }
  return await result.json();
};

export const updateRoom = async (id, data) => {
  const result = await fetch(`${roomURI}/${id}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (result.status === 404) {
    throw new Error("Resource not found");
  }
  if (result.status === 403) {
    throw new Error("Forbidden");
  }
  if (result.status >= 300) {
    throw new Error("Server error");
  }
  return await result.json();
};

export const sendAuthToken = async (email) => {
  const result = await fetch(`${authURI}/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userEmail: email }),
    credentials: "include",
  });

  if (result.status !== 200) {
    throw new Error("Can't send token");
  }
};

export const login = async (userHash, token) => {
  const result = await fetch(`${authURI}/verify/${userHash}/${token}`, {
    credentials: "include",
  });

  if (result.status !== 200) {
    throw new Error("Auth failed");
  }
};

export const checkAuthentication = async () => {
  const result = await fetch(`${authURI}/check`, {
    credentials: "include",
  });

  if (result.status !== 200) {
    return false;
  }
  return true;
};

export const logout = async () => {
  const result = await fetch(`${authURI}/logout/`, {
    credentials: "include",
  });

  if (result.status !== 200) {
    throw new Error("Logout failed");
  }
};

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
