import { jest } from '@jest/globals';

jest.unstable_mockModule('node:fs', () => ({
  readFileSync: jest.fn().mockReturnValue('{ "name": "alpha", "version": "1.0.0" }'),
}));

describe('loadPackageJson', () => {
  const packageJsonPath = '/root/alpha/package.json';
  const packageJson = { name: 'alpha', version: '1.0.0' };

  describe('when there is a cached package.json', () => {
    let mockedReadFileSync: jest.Mocked<typeof import('node:fs')['readFileSync']>;

    beforeEach(async () => {
      const { addPackageJsonToCache, clearPackageJsonCache } = await import('./loadPackageJson.js');
      clearPackageJsonCache();
      addPackageJsonToCache(packageJsonPath, packageJson);

      const { readFileSync } = await import('node:fs');
      mockedReadFileSync = jest.mocked(readFileSync);
      mockedReadFileSync.mockClear();
    });

    it('should return the cached package.json', async () => {
      const { loadPackageJson } = await import('./loadPackageJson.js');
      expect(loadPackageJson(packageJsonPath)).toEqual(packageJson);
    });

    it('should not load the package.json', async () => {
      const { loadPackageJson } = await import('./loadPackageJson.js');
      loadPackageJson(packageJsonPath);
      expect(mockedReadFileSync).not.toHaveBeenCalled();
    });
  });

  describe('when there is an error loading the package.json', () => {
    let mockedReadFileSync: jest.Mocked<typeof import('node:fs')['readFileSync']>;

    beforeEach(async () => {
      const { clearPackageJsonCache } = await import('./loadPackageJson.js');
      clearPackageJsonCache();

      const { readFileSync } = await import('node:fs');
      mockedReadFileSync = jest.mocked(readFileSync);
      mockedReadFileSync.mockClear();

      mockedReadFileSync.mockImplementationOnce(() => {
        throw new Error('oops');
      });
    });

    it('should throw the correct error', async () => {
      const { loadPackageJson } = await import('./loadPackageJson.js');

      expect(() => loadPackageJson(packageJsonPath)).toThrow(
        new Error(`Could not resolve the package.json at: ${packageJsonPath}`)
      );
    });
  });

  describe('when the package.json name is missing', () => {
    let mockedReadFileSync: jest.Mocked<typeof import('node:fs')['readFileSync']>;

    beforeEach(async () => {
      const { clearPackageJsonCache } = await import('./loadPackageJson.js');
      clearPackageJsonCache();

      const { readFileSync } = await import('node:fs');
      mockedReadFileSync = jest.mocked(readFileSync);
      mockedReadFileSync.mockClear();
      mockedReadFileSync.mockReturnValueOnce('{ "version": "1.0.0" }');
    });

    it('should throw the correct error', async () => {
      const { loadPackageJson } = await import('./loadPackageJson.js');

      expect(() => loadPackageJson(packageJsonPath)).toThrow(
        new Error(`Expected the package.json at "${packageJsonPath}" to have a name`)
      );
    });
  });

  describe('when the package.json version is missing', () => {
    let mockedReadFileSync: jest.Mocked<typeof import('node:fs')['readFileSync']>;

    beforeEach(async () => {
      const { clearPackageJsonCache } = await import('./loadPackageJson.js');
      clearPackageJsonCache();

      const { readFileSync } = await import('node:fs');
      mockedReadFileSync = jest.mocked(readFileSync);
      mockedReadFileSync.mockClear();
      mockedReadFileSync.mockReturnValueOnce('{ "name": "alpha" }');
    });

    it('should throw the correct error', async () => {
      const { loadPackageJson } = await import('./loadPackageJson.js');

      expect(() => loadPackageJson(packageJsonPath)).toThrow(
        new Error(`Expected the package.json at "${packageJsonPath}" to have a version`)
      );
    });
  });

  describe('when the package.json name and version are present', () => {
    beforeEach(async () => {
      const { clearPackageJsonCache } = await import('./loadPackageJson.js');
      clearPackageJsonCache();
    });

    it('should return the package.json', async () => {
      const { loadPackageJson } = await import('./loadPackageJson.js');
      expect(loadPackageJson(packageJsonPath)).toEqual(packageJson);
    });

    it('should cache the package.json', async () => {
      const { getCachedPackageJsons, loadPackageJson } = await import('./loadPackageJson.js');
      loadPackageJson(packageJsonPath);
      expect(getCachedPackageJsons()).toEqual({ [packageJsonPath]: packageJson });
    });
  });
});
