import { jest } from '@jest/globals';
import type { PathOrFileDescriptor, WriteFileOptions } from 'node:fs';

jest.unstable_mockModule('./getNewVersion.js', () => ({
  getNewVersion: jest.fn().mockReturnValue('1.1.0'),
}));

jest.unstable_mockModule('./getLatestPackageVersionOnNpm.js', () => ({
  getLatestPackageVersionOnNpm: jest.fn().mockReturnValue('1.0.0'),
}));

jest.unstable_mockModule('node:fs', () => ({
  writeFileSync: jest.fn(),
}));

describe('versionPackage', () => {
  const packageJsonPath = '/root/alpha/package.json';
  const packageJson = { name: 'alpha', version: '1.0.0' };

  describe('when the new version is invalid', () => {
    beforeEach(async () => {
      const { getNewVersion } = await import('./getNewVersion.js');
      const mockedGetNewVersion = jest.mocked(getNewVersion);
      mockedGetNewVersion.mockClear();
      mockedGetNewVersion.mockReturnValueOnce(null); // eslint-disable-line unicorn/no-null
    });

    it('should throw the correct error', async () => {
      const { versionPackage } = await import('./versionPackage.js');

      expect(() => versionPackage(packageJson, { packageJsonPath, type: 'minor' })).toThrow(
        new Error('The new package verison for a minor increment on 1.0.0 is invalid')
      );
    });
  });

  describe('when the new version is equal to the latest version on npm', () => {
    beforeEach(async () => {
      const { getLatestPackageVersionOnNpm } = await import('./getLatestPackageVersionOnNpm.js');
      const mockedGetLatestPackageVersionOnNpm = jest.mocked(getLatestPackageVersionOnNpm);
      mockedGetLatestPackageVersionOnNpm.mockClear();
      mockedGetLatestPackageVersionOnNpm.mockReturnValueOnce('1.1.0');
    });

    it('should throw the correct error', async () => {
      const { versionPackage } = await import('./versionPackage.js');

      expect(() => versionPackage(packageJson, { packageJsonPath, type: 'minor' })).toThrow(
        new Error('The new package verison 1.1.0 is less than or equal to the lastest version 1.1.0 on npm')
      );
    });
  });

  describe('when the new version is less than the latest version on npm', () => {
    beforeEach(async () => {
      const { getLatestPackageVersionOnNpm } = await import('./getLatestPackageVersionOnNpm.js');
      const mockedGetLatestPackageVersionOnNpm = jest.mocked(getLatestPackageVersionOnNpm);
      mockedGetLatestPackageVersionOnNpm.mockClear();
      mockedGetLatestPackageVersionOnNpm.mockReturnValueOnce('2.0.0');
    });

    it('should throw the correct error', async () => {
      const { versionPackage } = await import('./versionPackage.js');

      expect(() => versionPackage(packageJson, { packageJsonPath, type: 'minor' })).toThrow(
        new Error('The new package verison 1.1.0 is less than or equal to the lastest version 2.0.0 on npm')
      );
    });
  });

  describe('when the new version is greater than the latest version on npm', () => {
    let mockedWriteFileSync: jest.MockedFunction<
      (
        file: PathOrFileDescriptor,
        data: string | NodeJS.ArrayBufferView,
        options?: WriteFileOptions | undefined
      ) => void
    >;

    beforeEach(async () => {
      const { writeFileSync } = await import('node:fs');
      mockedWriteFileSync = jest.mocked(writeFileSync);
      mockedWriteFileSync.mockClear();
    });

    it('should writeFileSync with the correct arguments', async () => {
      const { versionPackage } = await import('./versionPackage.js');
      versionPackage(packageJson, { packageJsonPath, type: 'minor' });

      expect(mockedWriteFileSync).toHaveBeenCalledWith(
        packageJsonPath,
        JSON.stringify({ ...packageJson, version: '1.1.0' }, undefined, 2)
      );
    });
  });

  describe('when there is an exception throw writing the package.json', () => {
    beforeEach(async () => {
      const { writeFileSync } = await import('node:fs');
      const mockedWriteFileSync = jest.mocked(writeFileSync);
      mockedWriteFileSync.mockClear();

      mockedWriteFileSync.mockImplementationOnce(() => {
        throw new Error('oops');
      });
    });

    it('should throw the correct error', async () => {
      const { versionPackage } = await import('./versionPackage.js');

      expect(() => versionPackage(packageJson, { packageJsonPath, type: 'minor' })).toThrow(
        new Error('Could not write the package.json to: /root/alpha/package.json')
      );
    });
  });
});
