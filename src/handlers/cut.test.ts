import { jest } from '@jest/globals';
import type { PathOrFileDescriptor, WriteFileOptions } from 'node:fs';
import type { PackageJson, SetRequired } from 'type-fest';
import { clearShelljsMocks, shelljsMock } from '../__testUtils__/shelljs.js';
import type { ReleaseMeta } from '../types.js';

jest.unstable_mockModule('shelljs', shelljsMock);

jest.unstable_mockModule('../helpers/getPackageManager.js', () => ({
  getPackageManager: jest.fn().mockReturnValue('pnpm'),
}));

jest.unstable_mockModule('../helpers/getLastReleaseTag.js', () => ({
  getLastReleaseTag: jest.fn().mockReturnValue('v1.0.0'),
}));

jest.unstable_mockModule('../helpers/haveFilesChanged.js', () => ({
  haveFilesChanged: jest.fn().mockReturnValue(true),
}));

jest.unstable_mockModule('../helpers/loadPackageJson.js', () => ({
  loadPackageJson: jest.fn().mockReturnValue({
    version: '1.0.0',
  }),
}));

jest.unstable_mockModule('../helpers/isProjectMonorepo.js', () => ({
  isProjectMonorepo: jest.fn().mockReturnValue(false),
}));

jest.unstable_mockModule('../helpers/versionMonorepoPackages.js', () => ({
  versionMonorepoPackages: jest.fn(),
}));

jest.unstable_mockModule('../helpers/getChangedFiles.js', () => ({
  getChangedFiles: jest.fn().mockReturnValue([]),
}));

jest.unstable_mockModule('../helpers/versionPackage.js', () => ({
  versionPackage: jest.fn(),
}));

jest.unstable_mockModule('../helpers/getNewVersion.js', () => ({
  getNewVersion: jest.fn().mockReturnValue('1.1.0'),
}));

jest.unstable_mockModule('node:fs', () => ({
  writeFileSync: jest.fn(),
}));

jest.unstable_mockModule('../helpers/addCommitPushRelease.js', () => ({
  addCommitPushRelease: jest.fn(),
}));

process.cwd = jest.fn().mockReturnValue('/root') as jest.Mocked<() => string>;

describe('cut', () => {
  describe('when release type is not valid', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMocks(shelljs);
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
      clearShelljsMocks(shelljs);
    });

    it('should log the correct error message', async () => {
      const { cut } = await import('./cut.js');
      cut({ tag: 'blah', type: 'preminor' });

      expect(shelljs.echo).toHaveBeenCalledWith(
        expect.stringContaining('Error: Expected tag to be a valid release tag: alpha, beta, unstable')
      );
    });

    it('should exit with the correct code', async () => {
      const { cut } = await import('./cut.js');
      cut({ tag: 'blah', type: 'preminor' });
      expect(shelljs.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('when package manager is not found', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMocks(shelljs);

      const { getPackageManager } = await import('../helpers/getPackageManager.js');
      const mockedGetPackageManager = jest.mocked(getPackageManager);
      mockedGetPackageManager.mockReturnValueOnce(undefined); // eslint-disable-line unicorn/no-useless-undefined
    });

    it('should log the correct error message', async () => {
      const { cut } = await import('./cut.js');
      cut({ type: 'preminor' });

      expect(shelljs.echo).toHaveBeenCalledWith(
        expect.stringContaining(
          'Error: Could not derive the package manager from the lock file in the current working directory'
        )
      );
    });

    it('should exit with the correct code', async () => {
      const { cut } = await import('./cut.js');
      cut({ type: 'preminor' });
      expect(shelljs.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('when force is false and no files have changed', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMocks(shelljs);

      const { haveFilesChanged } = await import('../helpers/haveFilesChanged.js');
      const mockedHaveFilesChanged = jest.mocked(haveFilesChanged);
      mockedHaveFilesChanged.mockReturnValueOnce(false);
    });

    it('should log the correct error message', async () => {
      const { cut } = await import('./cut.js');
      cut({ type: 'preminor' });

      expect(shelljs.echo).toHaveBeenCalledWith(
        expect.stringContaining('Error: No files have changed since the last release tag: v1.0.0')
      );
    });

    it('should exit with the correct code', async () => {
      const { cut } = await import('./cut.js');
      cut({ type: 'preminor' });
      expect(shelljs.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('when the new project version is invalid', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMocks(shelljs);

      const { getNewVersion } = await import('../helpers/getNewVersion.js');
      const mockedGetNewVersion = jest.mocked(getNewVersion);
      mockedGetNewVersion.mockReturnValueOnce(null); // eslint-disable-line unicorn/no-null
    });

    it('should log the correct error message', async () => {
      const { cut } = await import('./cut.js');
      cut({ type: 'preminor' });

      expect(shelljs.echo).toHaveBeenCalledWith(
        expect.stringContaining('Error: The new project verison for a preminor increment on 1.0.0 is invalid')
      );
    });

    it('should exit with the correct code', async () => {
      const { cut } = await import('./cut.js');
      cut({ type: 'preminor' });
      expect(shelljs.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('cutoff:pre-version script', () => {
    describe('when the script is provided and skipPrehook is false', () => {
      let shelljs: jest.MockedObject<typeof import('shelljs')>;

      beforeEach(async () => {
        shelljs = jest.mocked(await import('shelljs')).default;
        clearShelljsMocks(shelljs);

        const { loadPackageJson } = await import('../helpers/loadPackageJson.js');
        const mockedLoadPackageJson = jest.mocked(loadPackageJson);

        mockedLoadPackageJson.mockReturnValueOnce({
          name: 'alpha',
          scripts: {
            'cutoff:pre-version': 'pnpm run pre-version-script',
          },
          version: '1.0.0',
        });
      });

      it('should execute the script', async () => {
        const { cut } = await import('./cut.js');
        cut({ type: 'preminor' });
        expect(shelljs.exec).toHaveBeenNthCalledWith(1, 'pnpm run cutoff:pre-version');
      });
    });

    describe('when the script is provided and skipPrehook is true', () => {
      let shelljs: jest.MockedObject<typeof import('shelljs')>;

      beforeEach(async () => {
        shelljs = jest.mocked(await import('shelljs')).default;
        clearShelljsMocks(shelljs);

        const { loadPackageJson } = await import('../helpers/loadPackageJson.js');
        const mockedLoadPackageJson = jest.mocked(loadPackageJson);

        mockedLoadPackageJson.mockReturnValueOnce({
          name: 'alpha',
          scripts: {
            'cutoff:pre-version': 'pnpm run pre-version-script',
          },
          version: '1.0.0',
        });
      });

      it('should not execute the script', async () => {
        const { cut } = await import('./cut.js');
        cut({ 'skip-prehook': true, type: 'preminor' });
        expect(shelljs.exec).not.toHaveBeenNthCalledWith(1, 'pnpm run cutoff:pre-version');
      });
    });

    describe('when the script is not provided', () => {
      let shelljs: jest.MockedObject<typeof import('shelljs')>;

      beforeEach(async () => {
        shelljs = jest.mocked(await import('shelljs')).default;
        clearShelljsMocks(shelljs);
      });

      it('should not execute the script', async () => {
        const { cut } = await import('./cut.js');
        cut({ type: 'preminor' });
        expect(shelljs.exec).not.toHaveBeenNthCalledWith(1, 'pnpm run cutoff:pre-version');
      });
    });
  });

  describe('cutoff:post-version script', () => {
    describe('when the script is provided and skipPosthook is false', () => {
      let shelljs: jest.MockedObject<typeof import('shelljs')>;

      beforeEach(async () => {
        shelljs = jest.mocked(await import('shelljs')).default;
        clearShelljsMocks(shelljs);

        const { loadPackageJson } = await import('../helpers/loadPackageJson.js');
        const mockedLoadPackageJson = jest.mocked(loadPackageJson);

        mockedLoadPackageJson.mockReturnValueOnce({
          name: 'alpha',
          scripts: {
            'cutoff:post-version': 'pnpm run post-version-script',
          },
          version: '1.0.0',
        });
      });

      it('should execute the script', async () => {
        const { cut } = await import('./cut.js');
        cut({ type: 'preminor' });
        expect(shelljs.exec).toHaveBeenNthCalledWith(1, 'pnpm run cutoff:post-version');
      });
    });

    describe('when the script is provided and skipPosthook is true', () => {
      let shelljs: jest.MockedObject<typeof import('shelljs')>;

      beforeEach(async () => {
        shelljs = jest.mocked(await import('shelljs')).default;
        clearShelljsMocks(shelljs);

        const { loadPackageJson } = await import('../helpers/loadPackageJson.js');
        const mockedLoadPackageJson = jest.mocked(loadPackageJson);

        mockedLoadPackageJson.mockReturnValueOnce({
          name: 'alpha',
          scripts: {
            'cutoff:post-version': 'pnpm run post-version-script',
          },
          version: '1.0.0',
        });
      });

      it('should not execute the script', async () => {
        const { cut } = await import('./cut.js');
        cut({ 'skip-posthook': true, type: 'preminor' });
        expect(shelljs.exec).not.toHaveBeenNthCalledWith(1, 'pnpm run cutoff:post-version');
      });
    });

    describe('when the script is not provided', () => {
      let shelljs: jest.MockedObject<typeof import('shelljs')>;

      beforeEach(async () => {
        shelljs = jest.mocked(await import('shelljs')).default;
        clearShelljsMocks(shelljs);
      });

      it('should not execute the script', async () => {
        const { cut } = await import('./cut.js');
        cut({ type: 'preminor' });
        expect(shelljs.exec).not.toHaveBeenNthCalledWith(1, 'pnpm run cutoff:post-version');
      });
    });
  });

  describe('when release type is either patch, minor or major', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMocks(shelljs);
    });

    it.each([['patch'], ['minor'], ['major']])('%p release should run changelog', async type => {
      const { cut } = await import('./cut.js');
      cut({ type });
      expect(shelljs.exec).toHaveBeenCalledWith(`pnpm run changelog -- --${type}`);
    });
  });

  describe('when release type is not either patch, minor or major', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMocks(shelljs);
    });

    it.each([['prepatch'], ['preminor'], ['premajor']])('%p release should not run changelog', async type => {
      const { cut } = await import('./cut.js');
      cut({ type });
      expect(shelljs.exec).not.toHaveBeenCalledWith(`pnpm run changelog -- --${type}`);
    });
  });

  describe('when project has a standard repo structure', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;
    let mockedGetChangedFiles: jest.MockedFunction<(releaseTag: string) => string[]>;

    let mockedVersionPackage: jest.MockedFunction<
      (
        packageJson: SetRequired<PackageJson, 'name' | 'version'>,
        releaseMeta: Pick<ReleaseMeta, 'packageJsonPath' | 'preReleaseId' | 'tag' | 'type'>
      ) => void
    >;

    let mockedAddCommitPushRelease: jest.MockedFunction<(version: string) => void>;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMocks(shelljs);

      const { getChangedFiles } = await import('../helpers/getChangedFiles.js');
      mockedGetChangedFiles = jest.mocked(getChangedFiles);
      mockedGetChangedFiles.mockClear();

      const { versionPackage } = await import('../helpers/versionPackage.js');
      mockedVersionPackage = jest.mocked(versionPackage);
      mockedVersionPackage.mockClear();

      const { addCommitPushRelease } = await import('../helpers/addCommitPushRelease.js');
      mockedAddCommitPushRelease = jest.mocked(addCommitPushRelease);
      mockedAddCommitPushRelease.mockClear();
    });

    it('should call getChangedFiles with the correct argument', async () => {
      const { cut } = await import('./cut.js');
      cut({ preid: '12345', tag: 'alpha', type: 'preminor' });
      expect(mockedGetChangedFiles).toHaveBeenCalledWith('v1.0.0');
    });

    it('should call versionPackage with the correct arguments', async () => {
      const { cut } = await import('./cut.js');
      cut({ preid: '12345', tag: 'alpha', type: 'preminor' });

      expect(mockedVersionPackage).toHaveBeenCalledWith(
        {
          version: '1.0.0',
        },
        {
          packageJsonPath: '/root/package.json',
          preReleaseId: '12345',
          tag: 'alpha',
          type: 'preminor',
        }
      );
    });

    it('should call addCommitPushRelease', async () => {
      const { cut } = await import('./cut.js');
      cut({ preid: '12345', tag: 'alpha', type: 'preminor' });
      expect(mockedAddCommitPushRelease).toHaveBeenCalled();
    });

    it('should exit with the correct code', async () => {
      const { cut } = await import('./cut.js');
      cut({ preid: '12345', tag: 'alpha', type: 'preminor' });
      expect(shelljs.exit).toHaveBeenCalledWith(0);
    });
  });

  describe('when project has a monorepo structure', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;

    let mockedVersionMonorepoPackages: jest.MockedFunction<
      (releaseMeta: Pick<ReleaseMeta, 'force' | 'packageManager' | 'preReleaseId' | 'tag' | 'type'>) => void
    >;

    let mockedWriteFileSync: jest.MockedFunction<
      (
        file: PathOrFileDescriptor,
        data: string | NodeJS.ArrayBufferView,
        options?: WriteFileOptions | undefined
      ) => void
    >;

    let mockedAddCommitPushRelease: jest.MockedFunction<(version: string) => void>;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMocks(shelljs);

      const { isProjectMonorepo } = await import('../helpers/isProjectMonorepo.js');
      const mockedIsProjectMonorepo = jest.mocked(isProjectMonorepo);
      mockedIsProjectMonorepo.mockReturnValue(true);

      const { versionMonorepoPackages } = await import('../helpers/versionMonorepoPackages.js');
      mockedVersionMonorepoPackages = jest.mocked(versionMonorepoPackages);
      mockedVersionMonorepoPackages.mockClear();

      const { writeFileSync } = await import('node:fs');
      mockedWriteFileSync = jest.mocked(writeFileSync);
      mockedWriteFileSync.mockClear();

      const { addCommitPushRelease } = await import('../helpers/addCommitPushRelease.js');
      mockedAddCommitPushRelease = jest.mocked(addCommitPushRelease);
      mockedAddCommitPushRelease.mockClear();
    });

    it('should call versionMonorepoPackages with the correct argument', async () => {
      const { cut } = await import('./cut.js');
      cut({ preid: '12345', tag: 'alpha', type: 'preminor' });

      expect(mockedVersionMonorepoPackages).toHaveBeenCalledWith({
        force: false,
        packageManager: 'pnpm',
        preReleaseId: '12345',
        tag: 'alpha',
        type: 'preminor',
      });
    });

    it('should call writeFileSync with the correct arguments', async () => {
      const { cut } = await import('./cut.js');
      cut({ preid: '12345', tag: 'alpha', type: 'preminor' });

      expect(mockedWriteFileSync).toHaveBeenCalledWith(
        '/root/package.json',
        JSON.stringify(
          {
            version: '1.1.0',
          },
          undefined,
          2
        )
      );
    });

    it('should call addCommitPushRelease', async () => {
      const { cut } = await import('./cut.js');
      cut({ preid: '12345', tag: 'alpha', type: 'preminor' });
      expect(mockedAddCommitPushRelease).toHaveBeenCalled();
    });

    it('should exit with the correct code', async () => {
      const { cut } = await import('./cut.js');
      cut({ preid: '12345', tag: 'alpha', type: 'preminor' });
      expect(shelljs.exit).toHaveBeenCalledWith(0);
    });
  });

  describe('when dry-run is set to true', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;
    let mockedAddCommitPushRelease: jest.MockedFunction<(version: string) => void>;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMocks(shelljs);

      const { addCommitPushRelease } = await import('../helpers/addCommitPushRelease.js');
      mockedAddCommitPushRelease = jest.mocked(addCommitPushRelease);
      mockedAddCommitPushRelease.mockClear();
    });

    it('should not call addCommitPushRelease', async () => {
      const { cut } = await import('./cut.js');
      cut({ 'dry-run': true, type: 'preminor' });
      expect(mockedAddCommitPushRelease).not.toHaveBeenCalled();
    });

    it('should exit with the correct code', async () => {
      const { cut } = await import('./cut.js');
      cut({ 'dry-run': true, type: 'preminor' });
      expect(shelljs.exit).toHaveBeenCalledWith(0);
    });
  });
});
