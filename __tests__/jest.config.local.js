/**
 * This is a local Jest configuration file for running tests without canvas dependency
 */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: '../',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/../jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/../src/components/$1',
    '^@/contexts/(.*)$': '<rootDir>/../src/contexts/$1',
    '^@/services/(.*)$': '<rootDir>/../src/services/$1',
    '^@/types/(.*)$': '<rootDir>/../src/types/$1',
    '^@/types$': '<rootDir>/../src/types/index.ts',
    // Mock out canvas
    "canvas": "<rootDir>/__mocks__/canvasMock.js"
  },
  testMatch: [
    "<rootDir>/*.test.[jt]s?(x)",
  ],
};

module.exports = createJestConfig(customJestConfig);