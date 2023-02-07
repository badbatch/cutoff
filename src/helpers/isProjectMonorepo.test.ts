import { jest } from '@jest/globals';

jest.unstable_mockModule('js-yaml', () => ({
  load: jest.fn<(value: string) => unknown>().mockImplementation((value: string) => JSON.parse(value)),
}));

jest.unstable_mockModule('node:fs', () => ({
  readFileSync: jest.fn(),
}));

jest.unstable_mockModule('./loadPackageJson.js', () => ({
  loadPackageJson: jest.fn(),
}));

process.cwd = jest.fn().mockReturnValue('/root') as jest.Mocked<() => string>;

describe('isProjectMonorepo', () => {
  describe('when the package manager is npm', () => {
    describe('when there are no workspaces declared', () => {
      beforeEach(async () => {
        const { loadPackageJson } = await import('./loadPackageJson.js');
        const mockedLoadPackageJson = jest.mocked(loadPackageJson);
        mockedLoadPackageJson.mockClear();
        mockedLoadPackageJson.mockReturnValue({ name: 'alpha', version: '1.0.0' });
      });

      it('should return false', async () => {
        const { isProjectMonorepo } = await import('./isProjectMonorepo.js');
        expect(isProjectMonorepo('npm')).toBe(false);
      });
    });

    describe('when workspaces is an array', () => {
      beforeEach(async () => {
        const { loadPackageJson } = await import('./loadPackageJson.js');
        const mockedLoadPackageJson = jest.mocked(loadPackageJson);
        mockedLoadPackageJson.mockClear();

        mockedLoadPackageJson.mockReturnValue({
          name: 'alpha',
          version: '1.0.0',
          workspaces: ['apps/**', 'configs/*', 'graphql/*'],
        });
      });

      it('should return true', async () => {
        const { isProjectMonorepo } = await import('./isProjectMonorepo.js');
        expect(isProjectMonorepo('npm')).toBe(true);
      });
    });

    describe('when workspaces is not an array', () => {
      beforeEach(async () => {
        const { loadPackageJson } = await import('./loadPackageJson.js');
        const mockedLoadPackageJson = jest.mocked(loadPackageJson);
        mockedLoadPackageJson.mockClear();

        mockedLoadPackageJson.mockReturnValue({
          name: 'alpha',
          version: '1.0.0',
          workspaces: { packages: ['apps/**', 'configs/*', 'graphql/*'] },
        });
      });

      it('should return true', async () => {
        const { isProjectMonorepo } = await import('./isProjectMonorepo.js');
        expect(isProjectMonorepo('npm')).toBe(true);
      });
    });
  });

  describe('when the package manager is yarn', () => {
    describe('when there are no workspaces declared', () => {
      beforeEach(async () => {
        const { loadPackageJson } = await import('./loadPackageJson.js');
        const mockedLoadPackageJson = jest.mocked(loadPackageJson);
        mockedLoadPackageJson.mockClear();
        mockedLoadPackageJson.mockReturnValue({ name: 'alpha', version: '1.0.0' });
      });

      it('should return false', async () => {
        const { isProjectMonorepo } = await import('./isProjectMonorepo.js');
        expect(isProjectMonorepo('yarn')).toBe(false);
      });
    });

    describe('when workspaces is an array', () => {
      beforeEach(async () => {
        const { loadPackageJson } = await import('./loadPackageJson.js');
        const mockedLoadPackageJson = jest.mocked(loadPackageJson);
        mockedLoadPackageJson.mockClear();

        mockedLoadPackageJson.mockReturnValue({
          name: 'alpha',
          version: '1.0.0',
          workspaces: ['apps/**', 'configs/*', 'graphql/*'],
        });
      });

      it('should return true', async () => {
        const { isProjectMonorepo } = await import('./isProjectMonorepo.js');
        expect(isProjectMonorepo('yarn')).toBe(true);
      });
    });

    describe('when workspaces is not an array', () => {
      beforeEach(async () => {
        const { loadPackageJson } = await import('./loadPackageJson.js');
        const mockedLoadPackageJson = jest.mocked(loadPackageJson);
        mockedLoadPackageJson.mockClear();

        mockedLoadPackageJson.mockReturnValue({
          name: 'alpha',
          version: '1.0.0',
          workspaces: { packages: ['apps/**', 'configs/*', 'graphql/*'] },
        });
      });

      it('should return true', async () => {
        const { isProjectMonorepo } = await import('./isProjectMonorepo.js');
        expect(isProjectMonorepo('yarn')).toBe(true);
      });
    });
  });

  describe('when the package manager is pnpm', () => {
    describe('when there are no workspaces declared', () => {
      beforeEach(async () => {
        const { readFileSync } = await import('node:fs');
        const mockedReadFileSync = jest.mocked(readFileSync);
        mockedReadFileSync.mockClear();
        mockedReadFileSync.mockReturnValue('{}');
      });

      it('should return false', async () => {
        const { isProjectMonorepo } = await import('./isProjectMonorepo.js');
        expect(isProjectMonorepo('pnpm')).toBe(false);
      });
    });

    describe('when workspaces are declared', () => {
      beforeEach(async () => {
        const { readFileSync } = await import('node:fs');
        const mockedReadFileSync = jest.mocked(readFileSync);
        mockedReadFileSync.mockClear();
        mockedReadFileSync.mockReturnValue('{ "packages": ["apps/**", "configs/*", "graphql/*"] }');
      });

      it('should return true', async () => {
        const { isProjectMonorepo } = await import('./isProjectMonorepo.js');
        expect(isProjectMonorepo('pnpm')).toBe(true);
      });
    });
  });

  describe('when an exception is thrown retreiving patterns', () => {
    beforeEach(async () => {
      const { readFileSync } = await import('node:fs');
      const mockedReadFileSync = jest.mocked(readFileSync);
      mockedReadFileSync.mockClear();

      mockedReadFileSync.mockImplementation(() => {
        throw new Error('oops');
      });
    });

    it('should return false', async () => {
      const { isProjectMonorepo } = await import('./isProjectMonorepo.js');
      expect(isProjectMonorepo('pnpm')).toBe(false);
    });
  });
});
