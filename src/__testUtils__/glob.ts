import { jest } from '@jest/globals';

export const clearGlobMock = (mock: jest.MockedObject<typeof import('glob')>) => {
  mock.sync.mockClear();
};

export const globMock = () => ({
  default: {
    sync: jest.fn(),
  },
});
