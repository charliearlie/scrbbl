/** @type {import("@types/eslint").Linter.BaseConfig} */
module.exports = {
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    "@remix-run/eslint-config/jest-testing-library",
    "prettier",
  ],
  env: {},
  // we're using vitest which has a very similar API to jest
  // (so the linting plugins work nicely), but it means we have to explicitly
  // set the jest version.
  settings: {
    jest: {
      version: 28,
    },
  },
  overrides: [
    {
      // Playwright's locator API reads like Testing Library's but is not it,
      // so those rules fire on every `page.getByRole` here. Same for the jest
      // rules: these are Playwright tests, not vitest ones.
      files: ["e2e/**/*.ts"],
      rules: {
        "testing-library/prefer-screen-queries": "off",
        "testing-library/no-await-sync-query": "off",
        "jest/no-conditional-expect": "off",
        "jest/expect-expect": "off",
      },
    },
  ],
};
