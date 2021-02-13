module.exports = {
  root: true,
  env: {
    es2020: true,
    node: true,
    mocha: true,
    "jest/globals": true,
  },
  parser: "babel-eslint",
  globals: {
    artifacts: "readonly",
    contract: "readonly",
    assert: "readonly",
    web3: true,
  },
  overrides: [
    {
      files: ["**/*.js"],
      extends: [
        "eslint:recommended",
        "standard",
        "plugin:prettier/recommended",
        "plugin:jest/recommended",
        "plugin:react/recommended",
      ],
      rules: {
        "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        "prettier/prettier": "warn",
        "no-var": "error",
        camelcase: "off",
        "jest/no-disabled-tests": "warn",
        "jest/no-focused-tests": "error",
        "jest/no-identical-title": "error",
        "jest/prefer-to-have-length": "warn",
        "jest/valid-expect": "error",
      },
    },
  ],
};
