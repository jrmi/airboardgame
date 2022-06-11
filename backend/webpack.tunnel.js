const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const LocaltunnelPlugin = require("webpack-plugin-localtunnel");

const prefix =
  process.env.TUNNEL_PREFIX || Math.random().toString().substr(2, 8);

module.exports = merge(common, {
  mode: "development",
  watchOptions: {
    ignored: ["node_modules/**"],
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    public: prefix + "-ricochet.loca.lt",
    compress: true,
    allowedHosts: [".loca.lt"],
    port: 9000,
  },
  plugins: [new LocaltunnelPlugin({ subdomain: prefix + "-ricochet" })],
});
