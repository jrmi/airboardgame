import { API_ENDPOINT, GAMELIST_URL, IS_PRODUCTION } from "./settings";
//import { nanoid } from "nanoid";

import testGame from "../games/testGame";
import perfGame from "../games/perfGame";

const uploadURI = `${API_ENDPOINT}/upload`;
const gameURI = `${API_ENDPOINT}/store/game`;

export const uploadImage = async (file) => {
  const payload = new FormData();
  payload.append("file", file);
  const result = await fetch(uploadURI, {
    method: "POST",
    body: payload, // this sets the `Content-Type` header to `multipart/form-data`
  });

  return await result.text();
};

// TODO Add delete Image

export const getGames = async () => {
  const result = await fetch(GAMELIST_URL);
  let gameList = await result.json();

  if (!IS_PRODUCTION) {
    gameList = [
      { name: "Test Game", data: testGame, id: "-1" },
      { name: "Perf Test", data: perfGame, id: "-2" },
      ...gameList,
    ];
  }

  return gameList.map((game, index) => ({ ...game, id: "" + index }));
  /*const result = await fetch(gameURI);
  return await result.json();*/
};

const fetchGame = async (url) => {
  const result = await fetch(url);
  return await result.json();
};

export const getGame = async (gameId) => {
  const games = await getGames();
  const game = games.find(({ id }) => id === gameId);
  if (!game) return null;

  const { url, data } = game;

  if (url) {
    return await fetchGame(url);
  } else {
    return data;
  }
  /*const result = await fetch(`${gameURI}/${id}`);
  return await result.json();*/
};

export const newGame = async (data) => {
  const result = await fetch(`${gameURI}/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return await result.json();
};

export const updateGame = async (id, data) => {
  const result = await fetch(`${gameURI}/${id}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return await result.json();
};

export const deleteGame = async (id) => {
  const result = await fetch(`${gameURI}/${id}`, {
    method: "DELETE",
  });
  return await result.json();
};
