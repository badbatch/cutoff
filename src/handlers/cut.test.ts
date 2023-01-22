import { jest } from '@jest/globals';
import type { PackageManager } from '../types.js';

jest.unstable_mockModule('shelljs', () => ({
  default: {
    echo: jest.fn(),
    exec: jest.fn(),
    exit: jest.fn(),
  },
}));

jest.unstable_mockModule('../helpers/getPackageManager.js', () => ({
  getPackageManager: jest.fn(),
}));

describe('cut', () => {
  describe('when release type is not valid', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
    });

    afterEach(() => {
      shelljs.echo.mockReset();
      shelljs.exit.mockReset();
    });

    it('should log the correct error message', async () => {
      const { cut } = await import('./cut.js');
      cut({ type: 'blah' });

      expect(shelljs.echo).toHaveBeenCalledWith(
        expect.stringContaining(
          'Error: Expected type to be a valid release type: major, premajor, minor, preminor, patch, prepatch, prerelease'
        )
      );
    });

    it('should exit with the correct code', async () => {
      const { cut } = await import('./cut.js');
      cut({ type: 'blah' });
      expect(shelljs.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('when release tag is not valid', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
    });

    afterEach(() => {
      shelljs.echo.mockReset();
      shelljs.exit.mockReset();
    });

    it('should log the correct error message', async () => {
      const { cut } = await import('./cut.js');
      cut({ tag: 'blah', type: 'minor' });

      expect(shelljs.echo).toHaveBeenCalledWith(
        expect.stringContaining('Error: Expected tag to be a valid release tag: alpha, beta, unstable')
      );
    });

    it('should exit with the correct code', async () => {
      const { cut } = await import('./cut.js');
      cut({ tag: 'blah', type: 'minor' });
      expect(shelljs.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('when package manager is not found', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;
    let mockedGetPackageManager: jest.MockedFunction<() => PackageManager | undefined>;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      const { getPackageManager } = await import('../helpers/getPackageManager.js');
      mockedGetPackageManager = jest.mocked(getPackageManager);
      mockedGetPackageManager.mockReturnValueOnce(undefined); // eslint-disable-line unicorn/no-useless-undefined
    });

    afterEach(() => {
      shelljs.echo.mockReset();
      shelljs.exit.mockReset();
      mockedGetPackageManager.mockClear();
    });

    it('should log the correct error message', async () => {
      const { cut } = await import('./cut.js');
      cut({ type: 'minor' });

      expect(shelljs.echo).toHaveBeenCalledWith(
        expect.stringContaining(
          'Error: Could not derive the package manager from the lock file in the current working directory'
        )
      );
    });

    it('should exit with the correct code', async () => {
      const { cut } = await import('./cut.js');
      cut({ type: 'minor' });
      expect(shelljs.exit).toHaveBeenCalledWith(1);
    });
  });
});
