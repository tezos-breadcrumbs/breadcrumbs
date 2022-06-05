/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePaths: ["<rootDir>/"],
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  verbose: true,
};
