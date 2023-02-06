import { jest } from '@jest/globals';
import { clearShelljsMock, shelljsMock } from '../__testUtils__/shelljs.js';
import type { PackageManager, ReleaseMeta } from '../types.js';

jest.unstable_mockModule('shelljs', shelljsMock);

jest.unstable_mockModule('../helpers/getPackageManager.js', () => ({
  getPackageManager: jest.fn().mockReturnValue('pnpm'),
}));

jest.unstable_mockModule('../helpers/isProjectMonorepo.js', () => ({
  isProjectMonorepo: jest.fn().mockReturnValue(false),
}));

jest.unstable_mockModule('../helpers/publishMonorepoPackages.js', () => ({
  publishMonorepoPackages: jest.fn(),
}));

jest.unstable_mockModule('../helpers/publishPackage.js', () => ({
  publishPackage: jest.fn(),
}));

process.cwd = jest.fn().mockReturnValue('/root') as jest.Mocked<() => string>;

describe('publish', () => {
  describe('when package manager is not found', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMock(shelljs);

      const { getPackageManager } = await import('../helpers/getPackageManager.js');
      const mockedGetPackageManager = jest.mocked(getPackageManager);
      mockedGetPackageManager.mockReturnValueOnce(undefined); // eslint-disable-line unicorn/no-useless-undefined
    });

    it('should log the correct error message', async () => {
      const { publish } = await import('./publish.js');
      publish();

      expect(shelljs.echo).toHaveBeenCalledWith(
        expect.stringContaining(
          'Error: Could not derive the package manager from the lock file in the current working directory'
        )
      );
    });

    it('should exit with the correct code', async () => {
      const { publish } = await import('./publish.js');
      publish();
      expect(shelljs.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('when project has a standard repo structure', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;

    let mockedPublishPackage: jest.MockedFunction<
      (packageJsonPath: string, releaseMeta: Pick<ReleaseMeta, 'packageManager'>) => void
    >;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMock(shelljs);

      const { publishPackage } = await import('../helpers/publishPackage.js');
      mockedPublishPackage = jest.mocked(publishPackage);
      mockedPublishPackage.mockClear();
    });

    it('should call publishPackage with the correct arguments', async () => {
      const { publish } = await import('./publish.js');
      publish();

      expect(mockedPublishPackage).toHaveBeenCalledWith('/root/package.json', {
        packageManager: 'pnpm',
      });
    });

    it('should exit with the correct code', async () => {
      const { publish } = await import('./publish.js');
      publish();
      expect(shelljs.exit).toHaveBeenCalledWith(0);
    });
  });

  describe('when project has a monorepo structure', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;
    let mockedPublishMonorepoPackages: jest.MockedFunction<(packageManager: PackageManager) => void>;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMock(shelljs);

      const { isProjectMonorepo } = await import('../helpers/isProjectMonorepo.js');
      const mockedIsProjectMonorepo = jest.mocked(isProjectMonorepo);
      mockedIsProjectMonorepo.mockReturnValue(true);

      const { publishMonorepoPackages } = await import('../helpers/publishMonorepoPackages.js');
      mockedPublishMonorepoPackages = jest.mocked(publishMonorepoPackages);
      mockedPublishMonorepoPackages.mockClear();
    });

    it('should call publishMonorepoPackages with the correct argument', async () => {
      const { publish } = await import('./publish.js');
      publish();
      expect(mockedPublishMonorepoPackages).toHaveBeenCalledWith('pnpm');
    });

    it('should exit with the correct code', async () => {
      const { publish } = await import('./publish.js');
      publish();
      expect(shelljs.exit).toHaveBeenCalledWith(0);
    });
  });
});
