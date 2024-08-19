// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  mutate: [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
    "!src/test.ts",
    "!src/environments/*.ts",
  ],
  testRunner: "karma",
  karma: {
    configFile: "karma.conf.js",
    projectType: "angular-cli",
    config: {
      browsers: ["ChromeHeadless"],
    },
  },
  reporters: ["progress", "clear-text", "html"],
  concurrency: 2,
  concurrency_comment:
    "Recommended to use about half of your available cores when running stryker with Angular",
  coverageAnalysis: "perTest",
};
export default config;
