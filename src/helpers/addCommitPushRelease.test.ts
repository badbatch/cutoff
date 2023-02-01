import { jest } from '@jest/globals';
import { clearShelljsMocks, shelljsMock } from '../__testUtils__/shelljs.js';
import { addCommitPushRelease } from './addCommitPushRelease.js';

jest.unstable_mockModule('shelljs', shelljsMock);

describe('addCommitPushRelease', () => {
  let shelljs: jest.MockedObject<typeof import('shelljs')>;

  beforeEach(async () => {
    shelljs = jest.mocked(await import('shelljs')).default;
    clearShelljsMocks(shelljs);
  });

  it('should run the correct git commands', () => {
    addCommitPushRelease('1.1.0');

    expect(shelljs.exec).toHaveBeenCalledWith(
      'git add --all',
      'git commit --no-verify -m "Release version 1.1.0."',
      'git push --no-verify',
      'git tag -a v1.1.0 -m "Release version 1.1.0."',
      'git push origin v1.1.0 --no-verify'
    );
  });
});
