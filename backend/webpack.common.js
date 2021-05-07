const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});
const CopyPlugin = require("copy-webpack-plugin");
const EncryptPlugin = require("ricochet-js").EncryptPlugin;
const Dotenv = require("dotenv-webpack");

const SECRET_KEY = process.env.RICOCHET_SECRET_KEY;

if (!SECRET_KEY) {
  console.log("You must define a RICOCHET_SECRET_KEY env variable");
  process.exit(-1);
}

module.exports = {
  entry: "./src/index.js",
  target: "node",
  devtool: false,
  output: {
    path: path.resolve(__dirname, "../public"),
    filename: "setup.js",
    library: {
      type: "commonjs",
    },
  },
  plugins: [
    new Dotenv(),
    new CopyPlugin({
      patterns: [
        {
          from: "**/*",
          context: path.resolve(__dirname, "public"),
        },
      ],
    }),
    new EncryptPlugin({
      key: process.env.RICOCHET_SECRET_KEY,
    }),
  ],
};
