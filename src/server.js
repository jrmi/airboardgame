const dotenv = require("dotenv");
dotenv.config();

var express = require("express");
var cors = require("cors");
const path = require("path");

var app = express();
var http = require("http").createServer(app);
var handleC2C = require("client2client.io").handleC2C;

const aws = require("aws-sdk");
const bodyParser = require("body-parser");
const multer = require("multer");
const multerS3 = require("multer-s3");

var mime = require("mime-types");
const nanoid = require("nanoid");

const port = process.env.SERVER_PORT || 4000;
const host = process.env.SERVER_HOST || "localhost";
const socketPath = process.env.REACT_APP_SOCKET_PATH || "/socket.io";

const FILE_STORAGE = process.env.FILE_STORAGE || "memory";
const DISK_DESTINATION = process.env.DISK_DESTINATION || "/tmp/airboardmedia";
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
const S3_SECRET_KEY = process.env.S3_SECRET_KEY;
const S3_ENDPOINT = process.env.S3_ENDPOINT;
const S3_BUCKET = process.env.S3_BUCKET;

app.use(cors());

app.use(bodyParser.json());

// Memory storage
if (FILE_STORAGE === "memory") {
  const imageMap = {};
  const upload = multer({ storage: multer.memoryStorage() });

  app.post("/upload", upload.single("file"), (req, res) => {
    const ext = mime.extension(req.file.mimetype);
    const filename = `${nanoid.nanoid()}.${ext}`;
    imageMap[filename] = req.file.buffer;
    res.send(`http://${host}:${port}/image/${filename}`);
  });

  app.get("/image/:filename", (req, res) => {
    const fileBuffer = imageMap[req.params.filename];
    res.send(fileBuffer);
  });
}

// File storage
if (FILE_STORAGE === "disk") {
  const storage = multer.diskStorage({
    destination: DISK_DESTINATION,
    filename: function (req, file, cb) {
      const ext = mime.extension(file.mimetype);
      const filename = `${nanoid.nanoid()}.${ext}`;
      cb(null, filename);
    },
  });

  const upload = multer({ storage: storage });

  app.post("/upload", upload.single("file"), (req, res) => {
    res.send(`http://${host}:${port}/image/${req.file.filename}`);
  });

  app.get("/image/:filename", (req, res) => {
    const file = `${DISK_DESTINATION}/${req.params.filename}`;
    res.download(file);
  });
}

// S3 storage
if (FILE_STORAGE === "s3") {
  aws.config.update({
    secretAccessKey: S3_SECRET_KEY,
    accessKeyId: S3_ACCESS_KEY,
    endpoint: S3_ENDPOINT,
  });

  const s3 = new aws.S3();

  const upload = multer({
    storage: multerS3({
      s3: s3,
      acl: "public-read",
      bucket: S3_BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const ext = mime.extension(file.mimetype);
        cb(null, `${nanoid.nanoid()}.${ext}`);
      },
    }),
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
    fileFilter: (req, file, cb) => {
      checkFileType(file, cb);
    },
  });

  app.post("/upload", upload.single("file"), (req, res) => {
    res.send(req.file.location);
  });
}

var io = require("socket.io")(http, { path: socketPath });

app.use(express.static(path.join(__dirname, "../build")));

// Handles any requests that don't match the ones above
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build/index.html"));
});

http.listen(port, host, () => {
  console.log(`listening on ${host}:${port}`);
});

io.on("connection", (socket) => {
  handleC2C(socket);
});

const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
};
