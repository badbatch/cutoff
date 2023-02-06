import { jest } from '@jest/globals';

jest.unstable_mockModule('node:fs', () => ({
  existsSync: jest.fn(),
}));

process.cwd = jest.fn().mockReturnValue('/root') as jest.Mocked<() => string>;

describe('getPackageManager', () => {
  describe('when repo has npm lock file', () => {
    beforeEach(async () => {
      const { existsSync } = jest.mocked(await import('node:fs'));
      existsSync.mockClear();
      existsSync.mockImplementation(path => path === '/root/package-lock.json');
    });

    it('should return npm', async () => {
      const { getPackageManager } = await import('./getPackageManager.js');
      expect(getPackageManager()).toBe('npm');
    });
  });

  describe('when repo has pnpm lock file', () => {
    beforeEach(async () => {
      const { existsSync } = jest.mocked(await import('node:fs'));
      existsSync.mockClear();
      existsSync.mockImplementation(path => path === '/root/pnpm-lock.yaml');
    });

    it('should return pnpm', async () => {
      const { getPackageManager } = await import('./getPackageManager.js');
      expect(getPackageManager()).toBe('pnpm');
    });
  });

  describe('when repo has yarn lock file', () => {
    beforeEach(async () => {
      const { existsSync } = jest.mocked(await import('node:fs'));
      existsSync.mockClear();
      existsSync.mockImplementation(path => path === '/root/yarn.lock');
    });

    it('should return yarn', async () => {
      const { getPackageManager } = await import('./getPackageManager.js');
      expect(getPackageManager()).toBe('yarn');
    });
  });

  describe('when no lock file is found', () => {
    beforeEach(async () => {
      const { existsSync } = jest.mocked(await import('node:fs'));
      existsSync.mockClear();
      existsSync.mockReturnValue(false);
    });

    it('should return undefined', async () => {
      const { getPackageManager } = await import('./getPackageManager.js');
      expect(getPackageManager()).toBeUndefined();
    });
  });
});
