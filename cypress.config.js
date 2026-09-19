const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5000",
    specPattern: "cypress/integration/**/*.spec.js",
    supportFile: "cypress/support/index.js",
    setupNodeEvents(on, config) {
      require("./cypress/plugins/index.js")(on, config);
      return config;
    },
  },
});
