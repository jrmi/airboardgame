import crypto from "node:crypto";
import { HttpError } from "./services.js";

const auth = () => `Basic ${Buffer.from(`OPENVIDUAPP:${process.env.OPENVIDU_SECRET}`).toString("base64")}`;
export const getConfToken = async (sessionId) => {
  if (!sessionId || !process.env.OPENVIDU_URL || !process.env.OPENVIDU_SECRET) throw new HttpError(404, "Webconference not enabled");
  const headers = { Authorization: auth(), "Content-Type": "application/json" };
  const response = await fetch(`${process.env.OPENVIDU_URL}/openvidu/api/sessions`, { method: "POST", headers, body: JSON.stringify({ customSessionId: sessionId }) });
  if (response.status !== 409 && !response.ok) throw new HttpError(response.status === 403 ? 403 : 503, "OpenVidu session unavailable");
  const actualId = response.status === 409 ? sessionId : (await response.json()).id;
  const tokenResponse = await fetch(`${process.env.OPENVIDU_URL}/openvidu/api/sessions/${encodeURIComponent(actualId)}/connection`, { method: "POST", headers, body: JSON.stringify({}) });
  if (!tokenResponse.ok) throw new HttpError(tokenResponse.status === 403 ? 403 : 503, "OpenVidu connection unavailable");
  return (await tokenResponse.json()).token;
};

export const randomId = () => crypto.randomBytes(12).toString("hex");

