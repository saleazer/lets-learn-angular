// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  mutate: process.env.FILESTOSTRYKE ? process.env.FILESTOSTRYKE.split(', ') : [],
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
  ignoreStatic: true
};
export default config;
