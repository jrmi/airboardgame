export const USE_PROXY =
  import.meta.env.DEV && import.meta.env.VITE_USE_PROXY !== "0";

export const API_ENDPOINT = USE_PROXY
  ? ""
  : import.meta.env.VITE_API_ENDPOINT ||
    window.location.origin ||
    "http://localhost:3001";

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  window.location.origin ||
  "http://localhost:3001";

export const SOCKET_PATH = import.meta.env.VITE_SOCKET_PATH || "/socket.io";

export const SHOW_WELCOME = import.meta.env.VITE_NO_WELCOME !== "1";

export const GAMELIST_URL =
  import.meta.env.VITE_GAMELIST_URL || "/gamelist.json";

export const IS_PRODUCTION = import.meta.env.PROD;

export const SOCKET_OPTIONS = {
  forceNew: true,
  path: SOCKET_PATH,
  transports: ["websocket"],
};
