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
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  globals: {
    'ts-jest': {
      tsConfigFile: 'tsconfig.test.json',
      useBabelrc: true,
    },
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
  testMatch: [
    '**/src/**/*.test.*',
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  verbose: true,
};
