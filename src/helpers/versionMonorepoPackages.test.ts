import { jest } from '@jest/globals';
import type { PackageJson, SetRequired } from 'type-fest';
import { loadPackageJsonMock } from '../__testUtils__/loadPackageJson.js';
import type { ReleaseMeta } from '../types.js';

jest.unstable_mockModule('./getMonorepoPackageMeta.js', () => ({
  getMonorepoPackageMeta: jest.fn().mockReturnValue({
    alpha: {
      force: false,
      name: 'alpha',
      path: '/root/apps/client/alpha/package.json',
    },
    bravo: {
      force: false,
      name: 'bravo',
      path: '/root/apps/server/bravo/package.json',
    },
    delta: {
      force: false,
      name: 'delta',
      path: '/root/configs/delta/package.json',
    },
    echo: {
      force: false,
      name: 'echo',
      path: '/root/configs/echo/package.json',
    },
  }),
}));

jest.unstable_mockModule('./getLastReleaseTag.js', () => ({
  getLastReleaseTag: jest.fn().mockReturnValue('1.0.0'),
}));

jest.unstable_mockModule('./getChangedFiles.js', () => ({
  getChangedFiles: jest
    .fn()
    .mockReturnValue(['apps/client/alpha/src/index.ts', 'configs/delta/README.md', 'configs/delta/src/index.ts']),
}));

jest.unstable_mockModule('./loadPackageJson.js', loadPackageJsonMock);

jest.unstable_mockModule('./versionPackage.js', () => ({
  versionPackage: jest.fn(),
}));

process.cwd = jest.fn().mockReturnValue('/root') as jest.Mocked<() => string>;

describe('versionMonorepoPackages', () => {
  describe('when force is false', () => {
    let mockedVersionPackage: jest.MockedFunction<
      (
        packageJson: SetRequired<PackageJson, 'name' | 'version'>,
        meta: Pick<ReleaseMeta, 'packageJsonPath' | 'preReleaseId' | 'tag' | 'type'>
      ) => void
    >;

    beforeEach(async () => {
      const { versionPackage } = await import('./versionPackage.js');
      mockedVersionPackage = jest.mocked(versionPackage);
      mockedVersionPackage.mockClear();
    });

    it('should version packages in which files have changed since last tag', async () => {
      const { versionMonorepoPackages } = await import('./versionMonorepoPackages.js');
      versionMonorepoPackages({ force: false, packageManager: 'npm', type: 'major' });

      expect(mockedVersionPackage.mock.calls).toEqual([
        [
          { name: 'delta', version: '1.0.0' },
          {
            packageJsonPath: '/root/configs/delta/package.json',
            preReleaseId: undefined,
            tag: undefined,
            type: 'major',
          },
        ],
        [
          { name: 'alpha', version: '1.0.0' },
          {
            packageJsonPath: '/root/apps/client/alpha/package.json',
            preReleaseId: undefined,
            tag: undefined,
            type: 'major',
          },
        ],
      ]);
    });
  });

  describe('when force is true', () => {
    let mockedVersionPackage: jest.MockedFunction<
      (
        packageJson: SetRequired<PackageJson, 'name' | 'version'>,
        meta: Pick<ReleaseMeta, 'packageJsonPath' | 'preReleaseId' | 'tag' | 'type'>
      ) => void
    >;

    beforeEach(async () => {
      const { versionPackage } = await import('./versionPackage.js');
      mockedVersionPackage = jest.mocked(versionPackage);
      mockedVersionPackage.mockClear();
    });

    it('should version packages regardless of whether files have changed', async () => {
      const { versionMonorepoPackages } = await import('./versionMonorepoPackages.js');
      versionMonorepoPackages({ force: true, packageManager: 'npm', type: 'major' });

      expect(mockedVersionPackage.mock.calls).toEqual([
        [
          { name: 'echo', version: '1.0.0' },
          {
            packageJsonPath: '/root/configs/echo/package.json',
            preReleaseId: undefined,
            tag: undefined,
            type: 'major',
          },
        ],
        [
          { name: 'delta', version: '1.0.0' },
          {
            packageJsonPath: '/root/configs/delta/package.json',
            preReleaseId: undefined,
            tag: undefined,
            type: 'major',
          },
        ],
        [
          { name: 'bravo', version: '1.0.0' },
          {
            packageJsonPath: '/root/apps/server/bravo/package.json',
            preReleaseId: undefined,
            tag: undefined,
            type: 'major',
          },
        ],
        [
          { name: 'alpha', version: '1.0.0' },
          {
            packageJsonPath: '/root/apps/client/alpha/package.json',
            preReleaseId: undefined,
            tag: undefined,
            type: 'major',
          },
        ],
      ]);
    });
  });

  describe('when versioned package has internal dependencies', () => {
    let mockedVersionPackage: jest.MockedFunction<
      (
        packageJson: SetRequired<PackageJson, 'name' | 'version'>,
        meta: Pick<ReleaseMeta, 'packageJsonPath' | 'preReleaseId' | 'tag' | 'type'>
      ) => void
    >;

    beforeEach(async () => {
      const { loadPackageJson } = await import('./loadPackageJson.js');
      const mockedLoadPackageJson = jest.mocked(loadPackageJson);
      mockedLoadPackageJson.mockClear();

      mockedLoadPackageJson.mockImplementation((path): SetRequired<PackageJson, 'name' | 'version'> => {
        const match = /\/([a-z]+)\/package.json$/.exec(path)!;
        const name = match[1]!;

        if (name === 'alpha') {
          return { name, peerDependencies: { echo: '< 2' }, version: '1.0.0' };
        }

        if (name === 'delta') {
          return { name, peerDependencies: { bravo: '< 2' }, version: '1.0.0' };
        }

        return { name, version: '1.0.0' };
      });

      const { versionPackage } = await import('./versionPackage.js');
      mockedVersionPackage = jest.mocked(versionPackage);
      mockedVersionPackage.mockClear();
    });

    it('should version the internal dependency packages regardless of whether their files have changed', async () => {
      const { versionMonorepoPackages } = await import('./versionMonorepoPackages.js');
      versionMonorepoPackages({ force: false, packageManager: 'npm', type: 'major' });

      expect(mockedVersionPackage.mock.calls).toEqual([
        [
          { name: 'delta', peerDependencies: { bravo: '< 2' }, version: '1.0.0' },
          {
            packageJsonPath: '/root/configs/delta/package.json',
            preReleaseId: undefined,
            tag: undefined,
            type: 'major',
          },
        ],
        [
          { name: 'bravo', version: '1.0.0' },
          {
            packageJsonPath: '/root/apps/server/bravo/package.json',
            preReleaseId: undefined,
            tag: undefined,
            type: 'major',
          },
        ],
        [
          { name: 'alpha', peerDependencies: { echo: '< 2' }, version: '1.0.0' },
          {
            packageJsonPath: '/root/apps/client/alpha/package.json',
            preReleaseId: undefined,
            tag: undefined,
            type: 'major',
          },
        ],
        [
          { name: 'echo', version: '1.0.0' },
          {
            packageJsonPath: '/root/configs/echo/package.json',
            preReleaseId: undefined,
            tag: undefined,
            type: 'major',
          },
        ],
      ]);
    });
  });
});
