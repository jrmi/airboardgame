const merge = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge.smart(common, {
  mode: "development",
  watch: true,
  watchOptions: {
    ignored: ["node_modules/**"],
  },
});
