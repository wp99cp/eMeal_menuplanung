/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
  moduleNameMapper: {},
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  reporters: ['<rootDir>/tests/utils/reporter.js'],
};

// set env variables from ../.env
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '../.env' });
