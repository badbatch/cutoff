import { jest } from '@jest/globals';

export const clearShelljsMock = (mock: jest.MockedObject<typeof import('shelljs')>) => {
  mock.echo.mockClear();
  mock.exec.mockClear();
  mock.exit.mockClear();
};

export const shelljsMock = () => ({
  default: {
    echo: jest.fn(),
    exec: jest.fn(),
    exit: jest.fn(),
  },
});
