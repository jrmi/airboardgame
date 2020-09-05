import aws from "aws-sdk";
import bodyParser from "body-parser";
import multer from "multer";
import multerS3 from "multer-s3";
import mime from "mime-types";
import { nanoid } from "nanoid";
import express from "express";

export const fileStorage = ({ type, config }) => {
  const app = express.Router();

  app.use(bodyParser.json());

  // Memory storage
  if (type === "memory") {
    const imageMap = {};
    const upload = multer({ storage: multer.memoryStorage() });

    app.post("/upload", upload.single("file"), (req, res) => {
      const ext = mime.extension(req.file.mimetype);
      const filename = `${nanoid()}.${ext}`;
      imageMap[filename] = req.file.buffer;
      res.send(`${config.url}/image/${filename}`);
    });

    app.get("/image/:filename", (req, res) => {
      const fileBuffer = imageMap[req.params.filename];
      res.send(fileBuffer);
    });
  }

  // File storage
  if (type === "disk") {
    const storage = multer.diskStorage({
      destination: config.destination,
      filename: function (req, file, cb) {
        const ext = mime.extension(file.mimetype);
        const filename = `${nanoid()}.${ext}`;
        cb(null, filename);
      },
    });

    const upload = multer({ storage: storage });

    app.post("/upload", upload.single("file"), (req, res) => {
      res.send(`${config.url}/image/${req.file.filename}`);
    });

    app.get("/image/:filename", (req, res) => {
      const file = `${config.destination}/${req.params.filename}`;
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
          const ext = mime.extension(file.mimetype);
          cb(null, `${nanoid()}.${ext}`);
        },
      }),
      limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
    });

    app.post("/upload", upload.single("file"), (req, res) => {
      res.send(req.file.location);
    });
  }
  return app;
};

export default fileStorage;
