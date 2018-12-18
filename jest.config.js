module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*',
    '!**/__test__/**',
    '!**/*.test.*',
    '!**/*.d.*',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'json',
    'lcov',
    'text-summary',
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
  testMatch: [
    '**/src/**/*.test.*',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};
