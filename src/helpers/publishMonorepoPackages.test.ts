import { jest } from '@jest/globals';
import { clearShelljsMock, shelljsMock } from '../__testUtils__/shelljs.js';
import type { ReleaseMeta } from '../types.js';

jest.unstable_mockModule('shelljs', shelljsMock);

jest.unstable_mockModule('./getMonorepoPackageMeta.js', () => ({
  getMonorepoPackageMeta: jest.fn().mockReturnValue({
    alpha: { name: 'alpha', path: '/root/alpha/package.json' },
    bravo: { name: 'bravo', path: '/root/bravo/package.json' },
    charlie: { name: 'charlie', path: '/root/charlie/package.json' },
  }),
}));

jest.unstable_mockModule('./publishPackage.js', () => ({
  publishPackage: jest.fn(),
}));

describe('publishMonorepoPackages', () => {
  describe('when packages are published successfully', () => {
    let mockedPublishPackage: jest.MockedFunction<
      (packageJsonPath: string, { packageManager }: Pick<ReleaseMeta, 'packageManager'>) => void
    >;

    beforeEach(async () => {
      const shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMock(shelljs);

      const { publishPackage } = await import('./publishPackage.js');
      mockedPublishPackage = jest.mocked(publishPackage);
      mockedPublishPackage.mockClear();
    });

    it('should call publishPackage with the correct arguments', async () => {
      const { publishMonorepoPackages } = await import('./publishMonorepoPackages.js');
      publishMonorepoPackages('npm');

      expect(mockedPublishPackage.mock.calls).toEqual([
        ['/root/alpha/package.json', { packageManager: 'npm' }],
        ['/root/bravo/package.json', { packageManager: 'npm' }],
        ['/root/charlie/package.json', { packageManager: 'npm' }],
      ]);
    });
  });

  describe('when there is an error publishing a package', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;

    let mockedPublishPackage: jest.MockedFunction<
      (packageJsonPath: string, { packageManager }: Pick<ReleaseMeta, 'packageManager'>) => void
    >;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMock(shelljs);

      const { publishPackage } = await import('./publishPackage.js');
      mockedPublishPackage = jest.mocked(publishPackage);
      mockedPublishPackage.mockClear();

      mockedPublishPackage.mockImplementation(path => {
        if (path.includes('bravo')) {
          throw new Error('oops');
        }
      });
    });

    it('should call publishPackage with the correct arguments', async () => {
      const { publishMonorepoPackages } = await import('./publishMonorepoPackages.js');
      publishMonorepoPackages('npm');

      expect(mockedPublishPackage.mock.calls).toEqual([
        ['/root/alpha/package.json', { packageManager: 'npm' }],
        ['/root/bravo/package.json', { packageManager: 'npm' }],
        ['/root/charlie/package.json', { packageManager: 'npm' }],
      ]);
    });

    it('should log the correct message', async () => {
      const { publishMonorepoPackages } = await import('./publishMonorepoPackages.js');
      publishMonorepoPackages('npm');
      expect(shelljs.echo).toHaveBeenCalledWith(expect.stringContaining('Error publishing bravo: oops'));
    });
  });
});
