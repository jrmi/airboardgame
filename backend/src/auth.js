import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { HttpError } from "./services.js";
import { sessionSecret } from "./config.js";

const tokens = new Map();
const secret = sessionSecret;
export const userIdForEmail = (email) =>
  crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex");

export const sessionCookie = (userId) => {
  const value = `${userId}.${crypto.createHmac("sha256", secret()).update(userId).digest("base64url")}`;
  return `session=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${10 * 24 * 60 * 60}`;
};
export const clearSessionCookie =
  "session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
export const mailFromOrigin = (origin) => `noreply@${new URL(origin).hostname}`;
const siteName = "Airboardgame";
const mailTranslations = {
  en: {
    subject: `[${siteName}] Your authentication link`,
    text: (url) =>
      `Hello,\n\nHere is the link that allows you to log in ${siteName}:\n\n${url}\n\nPlease click on the link or copy and paste it into your browser.\n\nYours sincerely,\n\n${siteName} team.`,
    html: (url) =>
      `<p>Hello,</p><p>Here is the link that allows you to log in ${siteName}:</p><p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p><p>Please click on the link or copy and paste it into your browser.</p><p>Yours sincerely,</p><p>${siteName} team.</p>`,
  },
  fr: {
    subject: `[${siteName}] Votre lien d'authentification`,
    text: (url) =>
      `Bonjour,\n\nVoici le lien qui vous permet de vous connecter à ${siteName} :\n\n${url}\n\nCliquez sur le lien ou copiez et collez-le dans votre navigateur.\n\nCordialement,\n\nL'équipe de ${siteName}.`,
    html: (url) =>
      `<p>Bonjour,</p><p>Voici le lien qui vous permet de vous connecter à ${siteName} :</p><p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p><p>Cliquez sur le lien ou copiez et collez-le dans votre navigateur.</p><p>Cordialement,</p><p>L'équipe de ${siteName}.</p>`,
  },
};

const escapeHtml = (value) =>
  value.replace(
    /[&<>\"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[
        character
      ]
  );

export const mailLanguage = (acceptLanguage = "") => {
  for (const preference of acceptLanguage.split(",")) {
    const [language, ...parameters] = preference.trim().toLowerCase().split(";");
    const quality = parameters.find((parameter) => parameter.trim().startsWith("q="));
    if (quality && Number(quality.trim().slice(2)) === 0) continue;
    const baseLanguage = language.split("-")[0];
    if (mailTranslations[baseLanguage]) return baseLanguage;
  }
  return "en";
};

export const authenticationMail = (url, acceptLanguage) => {
  const translation = mailTranslations[mailLanguage(acceptLanguage)];
  return {
    subject: translation.subject,
    text: translation.text(url),
    html: translation.html(url),
  };
};

export const currentUser = (request) => {
  const value = request.headers.cookie?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
  if (!value) return null;
  const [userId, signature] = value.split(".");
  const expected = crypto
    .createHmac("sha256", secret())
    .update(userId || "")
    .digest("base64url");
  const actual = Buffer.from(signature || "");
  const expectedBuffer = Buffer.from(expected);
  return userId &&
    actual.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actual, expectedBuffer)
    ? userId
    : null;
};
export const requestLogin = async (email, origin, acceptLanguage) => {
  const userId = userIdForEmail(email);
  const token = crypto.randomBytes(24).toString("hex");
  tokens.set(`${userId}:${token}`, Date.now() + 15 * 60 * 1000);
  const link = `${origin}/login/${userId}/${token}`;
  if ((process.env.EMAIL_HOST || "fake") === "fake")
    console.log(`Authentication link: ${link}`);
  else {
    const mail = authenticationMail(link, acceptLanguage);
    await nodemailer
      .createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      })
      .sendMail({
        from: mailFromOrigin(origin),
        to: email,
        ...mail,
      });
  }
};
export const verifyLogin = (userId, token) => {
  const key = `${userId}:${token}`;
  const expires = tokens.get(key);
  if (!expires || expires < Date.now())
    throw new HttpError(403, "Token invalid or has expired");
  tokens.delete(key);
};
