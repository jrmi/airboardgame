const { createProxyMiddleware } = require("http-proxy-middleware");
const spawnSync = require("child_process").spawnSync;

module.exports = (app) => {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const useProxy = process.env.REACT_APP_USE_PROXY !== "0";

  if (useProxy) {
    if (apiEndpoint === undefined) {
      // eslint-disable-next-line no-console
      console.error(
        "You must set your REACT_APP_API_HOST in your .env file or disable proxy"
      );
      // Sleep to have time to read the messages.
      spawnSync("sleep", [1.5]);
    }
    app.use(
      ["/store", "/file", "/execute", "/auth"],
      createProxyMiddleware({
        target: apiEndpoint,
        changeOrigin: true,
      })
    );
  }
};
