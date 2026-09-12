const path = require("path");
const { FlatCompat } = require("@eslint/eslintrc");
const eslint = require("@eslint/js");
const globals = require("globals");
const prettierPlugin = require("eslint-plugin-prettier");
const reactHooksPlugin = require("eslint-plugin-react-hooks");

const compat = new FlatCompat({
  baseDirectory: path.resolve(__dirname),
  recommendedConfig: eslint.configs.recommended,
});

module.exports = [
  ...compat.extends(
    "eslint:recommended",
    "plugin:react/recommended",
  ),
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.jest,
        ...globals.node,
      },
    },
    plugins: {
      prettier: prettierPlugin,
      "react-hooks": reactHooksPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...prettierPlugin.configs.recommended.rules,
      "linebreak-style": ["error", "unix"],
      quotes: ["error", "double"],
      semi: ["error", "always"],
      "no-unused-vars": ["error", { caughtErrors: "none" }],
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": [
        "warn",
        {
          additionalHooks: "useRecoilCallback",
        },
      ],
    },
  },
];
