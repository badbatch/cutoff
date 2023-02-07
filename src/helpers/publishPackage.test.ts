import { jest } from '@jest/globals';
import { loadPackageJsonMock } from '../__testUtils__/loadPackageJson.js';
import { shelljsMock } from '../__testUtils__/shelljs.js';
import type { PackageManager } from '../types.js';

jest.unstable_mockModule('shelljs', shelljsMock);

jest.unstable_mockModule('./getLatestPackageVersionOnNpm.js', () => ({
  getLatestPackageVersionOnNpm: jest.fn(),
}));

jest.unstable_mockModule('./getPublishCmd.js', () => ({
  getPublishCmd: jest.fn(),
}));

jest.unstable_mockModule('./loadPackageJson.js', loadPackageJsonMock);

describe('publishPackage', () => {
  const packageJsonPath = '/root/alpha/package.json';

  describe('when package version is less than the latest version on npm', () => {
    beforeEach(async () => {
      const { getLatestPackageVersionOnNpm } = await import('./getLatestPackageVersionOnNpm.js');
      const mockedGetLatestPackageVersionOnNpm = jest.mocked(getLatestPackageVersionOnNpm);
      mockedGetLatestPackageVersionOnNpm.mockReturnValueOnce('2.0.0');
    });

    it('should throw the correct error', async () => {
      const { publishPackage } = await import('./publishPackage.js');

      expect(() => publishPackage(packageJsonPath, { packageManager: 'npm' })).toThrow(
        new Error('The new alpha package verison 1.0.0 is less than or equal to the lastest version on npm: 2.0.0')
      );
    });
  });

  describe('when package version is equal to the latest version on npm', () => {
    beforeEach(async () => {
      const { getLatestPackageVersionOnNpm } = await import('./getLatestPackageVersionOnNpm.js');
      const mockedGetLatestPackageVersionOnNpm = jest.mocked(getLatestPackageVersionOnNpm);
      mockedGetLatestPackageVersionOnNpm.mockReturnValueOnce('1.0.0');
    });

    it('should throw the correct error', async () => {
      const { publishPackage } = await import('./publishPackage.js');

      expect(() => publishPackage(packageJsonPath, { packageManager: 'npm' })).toThrow(
        new Error('The new alpha package verison 1.0.0 is less than or equal to the lastest version on npm: 1.0.0')
      );
    });
  });

  describe('when package version is greater than the latest version on npm', () => {
    let mockedGetPublishCmd: jest.MockedFunction<
      (packageManager: PackageManager, version: string, tag?: string) => string
    >;

    beforeEach(async () => {
      const { getLatestPackageVersionOnNpm } = await import('./getLatestPackageVersionOnNpm.js');
      const mockedGetLatestPackageVersionOnNpm = jest.mocked(getLatestPackageVersionOnNpm);
      mockedGetLatestPackageVersionOnNpm.mockReturnValueOnce('0.5.0');

      const { getPublishCmd } = await import('./getPublishCmd.js');
      mockedGetPublishCmd = jest.mocked(getPublishCmd);
      mockedGetPublishCmd.mockClear();
    });

    it('should run the correct publish command', async () => {
      const { publishPackage } = await import('./publishPackage.js');
      publishPackage(packageJsonPath, { packageManager: 'npm' });
      expect(mockedGetPublishCmd).toHaveBeenCalledWith('npm', '1.0.0', undefined);
    });
  });
});
