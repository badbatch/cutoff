import { jest } from '@jest/globals';
import type { ChildProcess } from 'node:child_process';
import { clearShelljsMocks, shelljsMock } from '../__testUtils__/shelljs.js';

jest.unstable_mockModule('shelljs', shelljsMock);

describe('getChangedFiles', () => {
  describe('when there are cached changed files', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;

    const cachedChangedFiles = [
      '.editorconfig',
      '.gitignore',
      'package.json',
      'pnpm-lock.yaml',
      'src/cmds/cut.test.ts',
      'src/cmds/cut.ts',
      'src/cmds/publish.test.ts',
      'src/cmds/publish.ts',
      'src/cut-release/index.test.ts',
      'src/cut-release/index.ts',
      'src/handlers/cut.test.ts',
      'src/handlers/cut.ts',
      'src/handlers/publish.test.ts',
      'src/handlers/publish.ts',
    ];

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMocks(shelljs);

      const { addChangedFilesToCache, clearChangedFilesCache } = await import('./getChangedFiles.js');
      clearChangedFilesCache();
      addChangedFilesToCache(cachedChangedFiles);
    });

    it('should return the cached changed files', async () => {
      const { getChangedFiles } = await import('./getChangedFiles.js');
      expect(getChangedFiles('v1.1.0')).toEqual(cachedChangedFiles);
    });

    it('should not run the git diff command', async () => {
      const { getChangedFiles } = await import('./getChangedFiles.js');
      getChangedFiles('v1.1.0');
      expect(shelljs.exec).not.toHaveBeenCalled();
    });
  });

  describe('when there are no cached changed files', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;
    const cachedChangedFiles = ['.editorconfig', '.gitignore', 'package.json', 'pnpm-lock.yaml'];

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMocks(shelljs);

      shelljs.exec.mockReturnValue({
        stdout: '.editorconfig\n.gitignore\npackage.json\npnpm-lock.yaml\n',
      } as unknown as ChildProcess);

      const { clearChangedFilesCache } = await import('./getChangedFiles.js');
      clearChangedFilesCache();
    });

    it('should return the changed files', async () => {
      const { getChangedFiles } = await import('./getChangedFiles.js');
      expect(getChangedFiles('v1.1.0')).toEqual(cachedChangedFiles);
    });

    it('should cache the changed files', async () => {
      const { getCachedChangedFiles, getChangedFiles } = await import('./getChangedFiles.js');
      getChangedFiles('v1.1.0');
      expect(getCachedChangedFiles()).toEqual(cachedChangedFiles);
    });
  });
});
