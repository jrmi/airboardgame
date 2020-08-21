export const API_ENDPOINT =
  process.env.REACT_APP_API_ENDPOINT || "http://localhost:3001";

export const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || "http://localhost:4000";

export const SOCKET_PATH = process.env.REACT_APP_SOCKET_PATH || "/socket.io";

export const SHOW_WELCOME = process.env.REACT_APP_NO_WELCOME !== "1";
