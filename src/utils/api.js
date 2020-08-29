import { API_ENDPOINT } from "./settings";

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

export const getGames = async () => {
  const result = await fetch(gameURI);
  return await result.json();
};

export const getGame = async (id) => {
  const result = await fetch(`${gameURI}/${id}`);
  return await result.json();
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
