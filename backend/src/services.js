import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getCollection } from "./db/mongodb.js";
import { SITE_PREFIX } from "./config.js";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const id = (value) => value || crypto.randomBytes(12).toString("hex");
const now = () => new Date();

const userAdmin = async (userId) => {
  if (!userId) return false;
  const user = await (await getCollection("user")).findOne({ _id: userId });
  return Boolean(user?.isAdmin);
};

const canModifyGame = async (game, userId) =>
  Boolean(userId && (game?.owner === userId || (await userAdmin(userId))));

export const gameService = {
  async list(userId, query = {}) {
    const collection = await getCollection("game");
    const games = await collection
      .find({})
      .sort({
        [String(query.sort || "_createdOn").replace("-", "")]:
          query.sort?.startsWith("-") ? -1 : 1,
      })
      .skip(Math.max(0, Number(query.skip) || 0))
      .limit(Math.min(10000, Math.max(0, Number(query.limit) || 50)))
      .toArray();
    const admin = await userAdmin(userId);
    const visible = games.filter(
      (game) => game.board?.published || game.owner === userId || admin
    );
    if (!query.fields) return visible;
    const fields = String(query.fields).split(",");
    return visible.map((game) =>
      Object.fromEntries(
        fields
          .filter((field) => field in game)
          .map((field) => [field, game[field]])
      )
    );
  },
  async get(box, resourceId) {
    const result = await (
      await getCollection(box)
    ).findOne({ _id: resourceId });
    if (!result) throw new HttpError(404, "Box or resource not found");
    return result;
  },
  async save(box, resourceId, data, userId) {
    const collection = await getCollection(box);
    const existing = await collection.findOne({ _id: resourceId });
    if (box === "game" && existing && !(await canModifyGame(existing, userId)))
      throw new HttpError(403, "Modification allowed only for owner or Admin");
    if (box === "game" && !userId)
      throw new HttpError(
        403,
        "Game creation/modification not allowed for unauthenticated users"
      );
    if (box === "user" && resourceId !== userId)
      throw new HttpError(403, "You can only access your account");
    // POST is the compatibility full-replacement operation. Metadata and the
    // server-owned game owner are the only fields retained from the old doc.
    const document = { ...data, _id: resourceId };
    if (box === "game") document.owner = existing?.owner || userId;
    if (!existing) document._createdOn = now();
    document._updatedOn = now();
    await collection.replaceOne({ _id: resourceId }, document, {
      upsert: true,
    });
    return document;
  },
  async remove(resourceId, userId) {
    const game = await this.get("game", resourceId);
    if (!(await canModifyGame(game, userId)))
      throw new HttpError(403, "Modification allowed only for owner or Admin");
    const result = await (
      await getCollection("game")
    ).deleteOne({ _id: resourceId });
    if (!result.deletedCount)
      throw new HttpError(404, "Box or resource not found");
    return { message: "Deleted" };
  },
};

export const getOrCreateUser = async (userId) => {
  const collection = await getCollection("user");
  let user = await collection.findOne({ _id: userId });
  if (!user) {
    user = { _id: userId, _createdOn: now(), _updatedOn: now() };
    await collection.insertOne(user);
  }
  return user;
};

const mediaRoot = () =>
  process.env.DISK_DESTINATION || path.resolve("backend/media");
const mediaDir = (gameId) => path.join(mediaRoot(), gameId);
const safeFilename = (filename) => path.basename(filename);
const useS3 = () =>
  (process.env.FILE_STORAGE || process.env.FILE_STORE_BACKEND || "disk") ===
  "s3";
const useS3Proxy = () => process.env.S3_PROXY === "1";
const s3Cdn = () => (process.env.S3_CDN || "").replace(/\/$/, "");
const s3 = () =>
  new S3Client({
    region: process.env.S3_REGION || "fr-par",
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
    },
  });
const s3Key = (box, resourceId, filename) =>
  `${SITE_PREFIX}/${box}/${resourceId}/${safeFilename(filename)}`;

const mediaArguments = (
  boxOrResourceId,
  resourceIdOrFile,
  fileOrUserId,
  userId,
  isGeneric
) =>
  !isGeneric
    ? {
        box: "game",
        resourceId: boxOrResourceId,
        file: resourceIdOrFile,
        userId: fileOrUserId,
      }
    : {
        box: boxOrResourceId,
        resourceId: resourceIdOrFile,
        file: fileOrUserId,
        userId,
      };

const canModifyMedia = async (box, resourceId, userId) => {
  const resource = await gameService.get(box, resourceId);
  if (box === "game" && !(await canModifyGame(resource, userId)))
    throw new HttpError(403, "Forbidden");
  return resource;
};

export const mediaService = {
  async list(boxOrResourceId, resourceId) {
    const box = resourceId === undefined ? "game" : boxOrResourceId;
    const id = resourceId === undefined ? boxOrResourceId : resourceId;
    if (useS3()) {
      const result = await s3().send(
        new ListObjectsV2Command({
          Bucket: process.env.S3_BUCKET,
          Prefix: `${SITE_PREFIX}/${box}/${id}/`,
        })
      );
      return (result.Contents || []).map(({ Key }) =>
        mediaPath(box, id, Key.split("/").pop())
      );
    }
    try {
      return (await fs.readdir(mediaDir(id))).map((file) =>
        mediaPath(box, id, file)
      );
    } catch {
      throw new HttpError(404, "Files not found");
    }
  },
  async save(boxOrResourceId, resourceIdOrFile, fileOrUserId, userId) {
    const args = mediaArguments(
      boxOrResourceId,
      resourceIdOrFile,
      fileOrUserId,
      userId,
      arguments.length === 4
    );
    await canModifyMedia(args.box, args.resourceId, args.userId);
    const filename = `${crypto.randomBytes(16).toString("hex")}${path.extname(args.file.originalname || "")}`;
    if (useS3()) {
      await s3().send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: s3Key(args.box, args.resourceId, filename),
          Body: args.file.buffer,
          ContentType: args.file.mimetype,
        })
      );
    } else {
      await fs.mkdir(mediaDir(args.resourceId), { recursive: true });
      await fs.writeFile(
        path.join(mediaDir(args.resourceId), filename),
        args.file.buffer
      );
    }
    return mediaPath(args.box, args.resourceId, filename);
  },
  async remove(
    boxOrResourceId,
    resourceIdOrFilename,
    filenameOrUserId,
    userId
  ) {
    const args = mediaArguments(
      boxOrResourceId,
      resourceIdOrFilename,
      filenameOrUserId,
      userId,
      arguments.length === 4
    );
    await canModifyMedia(args.box, args.resourceId, args.userId);
    if (useS3())
      await s3().send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: s3Key(args.box, args.resourceId, args.file),
        })
      );
    else
      try {
        await fs.unlink(
          path.join(mediaDir(args.resourceId), safeFilename(args.file))
        );
      } catch {
        throw new HttpError(404, "File not found");
      }
    return { message: "Deleted" };
  },
  async get(boxOrResourceId, resourceIdOrFilename, filename) {
    const box = filename === undefined ? "game" : boxOrResourceId;
    const resourceId =
      filename === undefined ? boxOrResourceId : resourceIdOrFilename;
    const name = filename === undefined ? resourceIdOrFilename : filename;
    if (!useS3())
      return { path: path.join(mediaDir(resourceId), safeFilename(name)) };
    const cleanFilename = safeFilename(name);
    if (!useS3Proxy() && s3Cdn()) {
      return {
        redirectTo: `${s3Cdn()}/${s3Key(box, resourceId, cleanFilename)}`,
      };
    }
    try {
      return await s3().send(
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: s3Key(box, resourceId, name),
        })
      );
    } catch {
      throw new HttpError(404, "File not found");
    }
  },
};

export const mediaPath = (boxOrResourceId, resourceIdOrFilename, filename) => {
  const box = filename === undefined ? "game" : boxOrResourceId;
  const resourceId =
    filename === undefined ? boxOrResourceId : resourceIdOrFilename;
  const name = filename === undefined ? resourceIdOrFilename : filename;
  return `${SITE_PREFIX}/store/${box}/${resourceId}/file/${name}`;
};
export { mediaDir, safeFilename };

export const cleanupSessions = async () => {
  const cutoff = Date.now() - 60 * 24 * 60 * 60 * 1000;
  await (
    await getCollection("session")
  ).deleteMany({
    $or: [{ timestamp: { $exists: false } }, { timestamp: { $lt: cutoff } }],
  });
};
