import { API_ENDPOINT, IS_PRODUCTION } from "./settings";
//import { nanoid } from "nanoid";

import testGame from "../games/testGame";
import perfGame from "../games/perfGame";
import { nanoid } from "nanoid";

const uploadURI = `${API_ENDPOINT}/file`;
const gameURI = `${API_ENDPOINT}/store/game`;
const execURI = `${API_ENDPOINT}/execute`;
const authURI = `${API_ENDPOINT}/auth`;

export const uploadImage = async (namespace, file) => {
  const payload = new FormData();
  payload.append("file", file);
  const result = await fetch(`${uploadURI}/${namespace}/`, {
    method: "POST",
    body: payload, // this sets the `Content-Type` header to `multipart/form-data`
  });

  return await result.text();
};

// TODO Add delete Image

export const getGames = async () => {
  const fetchParams = new URLSearchParams({
    fields: "_id,board,owner",
  });

  const result = await fetch(`${gameURI}?${"" + fetchParams}`, {
    credentials: "include",
  });
  const serverGame = await result.json();

  let gameList = serverGame.map((game) => ({
    name: game.board.name,
    id: game._id,
    owner: game.owner,
    url: `${gameURI}/${game._id}`,
  }));

  if (!IS_PRODUCTION) {
    gameList = [
      { name: "Test Game", data: testGame, id: "test" },
      { name: "Perf Test", data: perfGame, id: "perf" },
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
  const games = await getGames();
  const game = games.find(({ id }) => id === gameId);
  if (!game) {
    throw new Error("Resource not found");
  }

  const { url, data } = game;

  if (url) {
    return await fetchGame(url);
  } else {
    return data;
  }
  /*const result = await fetch(`${gameURI}/${id}`);
  return await result.json();*/
};

export const createGame = async (data) => {
  const newGameId = nanoid();
  const result = await updateGame(newGameId, data);
  return result;
};

export const updateGame = async (id, data) => {
  const result = await fetch(`${execURI}/saveGame/${id}`, {
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
  return await result.json();
};

export const deleteGame = async (id) => {
  const result = await fetch(`${gameURI}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
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

export const logout = async () => {
  const result = await fetch(`${authURI}/logout/`, {
    credentials: "include",
  });

  if (result.status !== 200) {
    throw new Error("Logout failed");
  }
};
