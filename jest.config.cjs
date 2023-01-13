const config = require('@repodog/jest-config');

module.exports = {
  ...config,
  setupFilesAfterEnv: ['./jest.setup.cjs'],
};
