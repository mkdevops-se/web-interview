/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  // The test environment that will be used for testing
  // testEnvironment: "jest-environment-node",
  testEnvironment: 'node',

  // A map from regular expressions to paths to transformers
  // transform: undefined,
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
}

export default config
