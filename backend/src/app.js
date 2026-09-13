import { feathers } from "@feathersjs/feathers";
import express from "@feathersjs/express";
import multer from "multer";
import {
  gameService,
  getOrCreateUser,
  HttpError,
  mediaDir,
  mediaService,
  safeFilename,
} from "./services.js";
import {
  clearSessionCookie,
  currentUser,
  requestLogin,
  sessionCookie,
  verifyLogin,
} from "./auth.js";
import { getConfToken } from "./conference.js";
import { SITE_PREFIX } from "./config.js";

const json = express.json({ limit: "20mb" });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});
const site = SITE_PREFIX;
const send = (response, value) => response.json(value);
const route = (box) => `/store/${box}`;
export const clientOrigin = (request) => {
  if (process.env.CLIENT_URL) return process.env.CLIENT_URL.replace(/\/$/, "");
  if (request.get("origin") && request.get("origin") !== "null")
    return request.get("origin");
  try {
    return new URL(request.get("referer")).origin;
  } catch {
    return "http://localhost:3001";
  }
};

export const createApp = () => {
  const app = express(feathers());
  app.use(express.urlencoded({ extended: false }));
  app.use(json);
  app.use((request, response, next) => {
    request.userId = currentUser(request);
    next();
  });

  app.get("/health", (request, response) => send(response, { status: "ok" }));

  app.post("/auth/", async (request, response, next) => {
    try {
      await requestLogin(
        request.body?.userEmail || "",
        clientOrigin(request),
        request.get("accept-language")
      );
      send(response, { message: "Token sent" });
    } catch (error) {
      next(error);
    }
  });
  app.get("/auth/verify/:userId/:token", (request, response, next) => {
    try {
      if (request.userId !== request.params.userId)
        verifyLogin(request.params.userId, request.params.token);
      response.set("Set-Cookie", sessionCookie(request.params.userId));
      send(response, { message: "success" });
    } catch (error) {
      next(error);
    }
  });
  app.get("/auth/check", (request, response, next) =>
    request.userId
      ? send(response, { message: "success" })
      : next(new HttpError(403, "Not authenticated"))
  );
  app.get("/auth/logout/", (request, response) => {
    response.set("Set-Cookie", clearSessionCookie);
    send(response, { message: "logged out" });
  });

  app.get(route("game"), async (request, response, next) => {
    try {
      send(response, await gameService.list(request.userId, request.query));
    } catch (error) {
      next(error);
    }
  });
  for (const box of ["game", "session", "room"]) {
    app.get(`${route(box)}/:id`, async (request, response, next) => {
      try {
        send(response, await gameService.get(box, request.params.id));
      } catch (error) {
        next(error);
      }
    });
    app.post(`${route(box)}/:id`, async (request, response, next) => {
      try {
        send(
          response,
          await gameService.save(
            box,
            request.params.id,
            request.body || {},
            request.userId
          )
        );
      } catch (error) {
        next(error);
      }
    });
  }
  app.delete(`${route("game")}/:id`, async (request, response, next) => {
    try {
      send(
        response,
        await gameService.remove(request.params.id, request.userId)
      );
    } catch (error) {
      next(error);
    }
  });
  app.get(`${route("user")}/:id`, async (request, response, next) => {
    try {
      if (!request.userId || request.params.id !== request.userId)
        throw new HttpError(403, "You can only access your account");
      send(response, await getOrCreateUser(request.userId));
    } catch (error) {
      next(error);
    }
  });

  app.post(
    `${route("game")}/:id/file/`,
    upload.single("file"),
    async (request, response, next) => {
      try {
        if (!request.file) throw new HttpError(400, "file is required");
        response
          .type("text/plain")
          .send(
            await mediaService.save(
              request.params.id,
              request.file,
              request.userId
            )
          );
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(`${route("game")}/:id/file/`, async (request, response, next) => {
    try {
      send(response, await mediaService.list(request.params.id));
    } catch (error) {
      next(error);
    }
  });
  app.delete(
    `${route("game")}/:id/file/:filename`,
    async (request, response, next) => {
      try {
        send(
          response,
          await mediaService.remove(
            request.params.id,
            request.params.filename,
            request.userId
          )
        );
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    `${route("game")}/:id/file/:filename`,
    async (request, response, next) => {
      try {
        const file = await mediaService.get(
          request.params.id,
          request.params.filename
        );
        if (file.path)
          return response.sendFile(
            safeFilename(request.params.filename),
            { root: mediaDir(request.params.id) },
            (error) => error && next(new HttpError(404, "File not found"))
          );
        if (file.redirectTo) return response.redirect(file.redirectTo);
        if (file.ContentType) response.type(file.ContentType);
        if (file.ContentLength)
          response.set("Content-Length", String(file.ContentLength));
        file.Body.pipe(response);
      } catch (error) {
        next(error);
      }
    }
  );
  app.get("/execute/getConfToken", async (request, response, next) => {
    try {
      send(response, await getConfToken(request.query.session));
    } catch (error) {
      next(error);
    }
  });
  app.use((error, request, response, next) => {
    if (response.headersSent) return next(error);
    const status = error.status || 500;
    response.status(status).json({ message: error.message || "Server error" });
  });
  app.set("site", site);
  return app;
};
