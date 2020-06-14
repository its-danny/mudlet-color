module.exports = {
  extends: ["airbnb-typescript/base", "plugin:prettier/recommended"],

  plugins: ["simple-import-sort", "prettier"],

  rules: {
    "@typescript-eslint/quotes": "off",
    "simple-import-sort/sort": "error",
    "no-console": "off"
  },

  parserOptions: {
    project: "./tsconfig.json",
  },
};
