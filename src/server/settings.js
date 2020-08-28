import dotenv from "dotenv";
dotenv.config();

// Settings

export const PORT = process.env.SERVER_PORT || 4000;
export const HOST = process.env.SERVER_HOST || "localhost";
export const API_URL =
  process.env.REACT_APP_API_ENDPOINT || `http://${HOST}:${PORT}`;
export const SOCKET_PATH = process.env.REACT_APP_SOCKET_PATH || "/socket.io";
export const FILE_STORAGE = process.env.FILE_STORAGE || "memory";
export const DISK_DESTINATION =
  process.env.DISK_DESTINATION || "/tmp/airboardmedia";
export const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
export const S3_SECRET_KEY = process.env.S3_SECRET_KEY;
export const S3_ENDPOINT = process.env.S3_ENDPOINT;
export const S3_BUCKET = process.env.S3_BUCKET;
