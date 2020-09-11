import aws from "aws-sdk";
import bodyParser from "body-parser";
import multer from "multer";
import multerS3 from "multer-s3";
import mime from "mime-types";
import { nanoid } from "nanoid";
import express from "express";
import path from "path";
import fs from "fs";

export const fileStorage = ({ prefix = "/file", type, config }) => {
  const app = express.Router();

  app.use(bodyParser.json());

  // Memory storage
  if (type === "memory") {
    const imageMap = {};
    const upload = multer({ storage: multer.memoryStorage() });

    app.post(`${prefix}/:namespace/`, upload.single("file"), (req, res) => {
      const {
        params: { namespace },
      } = req;

      const ext = mime.extension(req.file.mimetype);
      const filename = `${nanoid()}.${ext}`;
      const store = imageMap[namespace] || {};
      store[filename] = req.file.buffer;
      imageMap[namespace] = store;
      res.send(`${config.url}/${prefix}/:namespace/${filename}`);
    });

    app.get(`${prefix}/:namespace/`, (req, res) => {
      const {
        params: { namespace },
      } = req;

      const store = imageMap[namespace] || {};
      const result = Object.keys(store);
      res.json(result);
    });

    app.get(`${prefix}/:namespace/:filename`, (req, res) => {
      const {
        params: { filename, namespace },
      } = req;

      if (!imageMap[namespace]) {
        res.status(404).send("Not found");
        return;
      }

      const fileBuffer = imageMap[namespace][filename];

      if (!fileBuffer) {
        res.status(404).send("Not found");
        return;
      }

      res.send(fileBuffer);
    });
  }

  // File storage
  if (type === "disk") {
    const storage = multer.diskStorage({
      destination: (req) => {
        const {
          params: { namespace = "default" },
        } = req.params;
        return path.join(config.destination, namespace);
      },
      filename: (req, file, cb) => {
        const ext = mime.extension(file.mimetype);
        const filename = `${nanoid()}.${ext}`;
        cb(null, filename);
      },
    });

    const upload = multer({ storage: storage });

    app.post(`${prefix}/:namespace/`, upload.single("file"), (req, res) => {
      res.send(`${config.url}/${prefix}/file/${req.file.filename}`);
    });

    app.get(`${prefix}/:namespace/`, (req, res) => {
      const {
        params: { namespace },
      } = req;

      const dir = path.join(config.destination, namespace);

      fs.readdir(dir, (err, files) => {
        if (err) {
          res.json([]);
        } else {
          res.json(files);
        }
      });
    });

    app.get(`${prefix}/:namespace/:filename`, (req, res) => {
      const {
        params: { filename, namespace },
      } = req;

      const file = path.join(config.destination, namespace, filename);
      res.download(file);
    });
  }

  // S3 storage
  if (type === "s3") {
    aws.config.update({
      secretAccessKey: config.secretKey,
      accessKeyId: config.accessKey,
      endpoint: config.endpoint,
    });

    const s3 = new aws.S3();

    const upload = multer({
      storage: multerS3({
        s3: s3,
        acl: "public-read",
        bucket: config.bucket,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
          const {
            params: { namespace },
          } = req;

          const ext = mime.extension(file.mimetype);
          cb(null, `${namespace}/${nanoid()}.${ext}`);
        },
      }),
      limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
    });

    app.post(`${prefix}/:namespace/`, upload.single("file"), (req, res) => {
      res.send(req.file.location);
    });

    app.get(`${prefix}/:namespace/`, (req, res) => {
      const {
        params: { namespace },
      } = req;

      const params = {
        Bucket: config.bucket,
        Delimiter: "/",
        Prefix: `/${namespace}/`,
      };

      s3.listObjects(params, (err, data) => {
        if (err) {
          return [];
        }
        console.log(data);
        res.send(data);
      });
    });
  }
  return app;
};

export default fileStorage;
