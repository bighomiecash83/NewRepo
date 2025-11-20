/**
 * Jest Configuration
 * Configure test runner, coverage, and environment
 */

module.exports = {
  displayName: "DMF Music Platform Tests",
  testEnvironment: "jsdom",
  roots: ["<rootDir>"],
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.test.{js,jsx,ts,tsx}",
    "!src/**/__tests__/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 5,
      lines: 5,
      statements: 5,
    },
  },
  verbose: true,
  setupFiles: ["<rootDir>/jest.setup.js"],
  testTimeout: 10000,
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@streamgod/(.*)$": "<rootDir>/src/streamgod/$1",
    "^streamgod/(.*)$": "<rootDir>/src/streamgod/$1",
  },
};
