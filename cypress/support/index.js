// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Keep text assertions deterministic across local machines and CI browsers.
// Setting LANGUAGE for the Cypress process does not change navigator.language
// in every browser (notably Chromium), while i18next detects that browser value.
Cypress.on("window:before:load", (window) => {
  Object.defineProperty(window.navigator, "language", {
    configurable: true,
    value: "en-US",
  });
  Object.defineProperty(window.navigator, "languages", {
    configurable: true,
    value: ["en-US", "en"],
  });
  window.localStorage.setItem("i18nextLng", "en");
});

// Alternatively you can use CommonJS syntax:
// require('./commands')
