import { jest } from '@jest/globals';
import type { ChildProcess } from 'node:child_process';
import { clearShelljsMock, shelljsMock } from '../__testUtils__/shelljs.js';

jest.unstable_mockModule('shelljs', shelljsMock);

describe('getLastReleaseTag', () => {
  describe('when there are cached changed files', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMock(shelljs);

      const { addLastReleaseTagToCache, clearLastReleaseTagCache } = await import('./getLastReleaseTag.js');
      clearLastReleaseTagCache();
      addLastReleaseTagToCache('v1.1.0');
    });

    it('should return the cached last release tag', async () => {
      const { getLastReleaseTag } = await import('./getLastReleaseTag.js');
      expect(getLastReleaseTag()).toEqual('v1.1.0');
    });

    it('should not run the git describe command', async () => {
      const { getLastReleaseTag } = await import('./getLastReleaseTag.js');
      getLastReleaseTag();
      expect(shelljs.exec).not.toHaveBeenCalled();
    });
  });

  describe('when there are no cached changed files', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMock(shelljs);

      shelljs.exec.mockReturnValue({
        stdout: 'v1.2.0',
      } as unknown as ChildProcess);

      const { clearLastReleaseTagCache } = await import('./getLastReleaseTag.js');
      clearLastReleaseTagCache();
    });

    it('should return the last release tag', async () => {
      const { getLastReleaseTag } = await import('./getLastReleaseTag.js');
      expect(getLastReleaseTag()).toBe('v1.2.0');
    });

    it('should run the git describe command', async () => {
      const { getLastReleaseTag } = await import('./getLastReleaseTag.js');
      getLastReleaseTag();
      expect(shelljs.exec).toHaveBeenCalledWith('git describe --tags --abbrev=0', { silent: true });
    });

    it('should cache the last release tag', async () => {
      const { getCachedLastReleaseTag, getLastReleaseTag } = await import('./getLastReleaseTag.js');
      getLastReleaseTag();
      expect(getCachedLastReleaseTag()).toBe('v1.2.0');
    });
  });
});
