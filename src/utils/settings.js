export const API_ENDPOINT =
  process.env.REACT_APP_API_ENDPOINT ||
  window.location.origin ||
  "http://localhost:3001";

export const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  window.location.origin ||
  "http://localhost:3001";

export const SOCKET_PATH = process.env.REACT_APP_SOCKET_PATH || "/socket.io";

export const SHOW_WELCOME = process.env.REACT_APP_NO_WELCOME !== "1";

export const GAMELIST_URL =
  process.env.REACT_APP_GAMELIST_URL || "/gamelist.json";

export const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const SOCKET_OPTIONS = {
  forceNew: true,
  path: SOCKET_PATH,
  transports: ["websocket"],
};
