// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettier = require("eslint-plugin-prettier");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
    plugins: {
      prettier,
    },
    rules: {
      "prettier/prettier": "error", // Active Prettier comme règle ESLint
      "no-unused-vars": "warn",     // Avertit si on déclares une variable non utilisée
    },
  },
]);

