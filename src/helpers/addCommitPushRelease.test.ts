import { jest } from '@jest/globals';
import { clearShelljsMocks, shelljsMock } from '../__testUtils__/shelljs.js';

jest.unstable_mockModule('shelljs', shelljsMock);

describe('addCommitPushRelease', () => {
  let shelljs: jest.MockedObject<typeof import('shelljs')>;

  beforeEach(async () => {
    shelljs = jest.mocked(await import('shelljs')).default;
    clearShelljsMocks(shelljs);
  });

  it('should run the correct git commands', async () => {
    const { addCommitPushRelease } = await import('./addCommitPushRelease.js');
    addCommitPushRelease('1.1.0');

    expect(shelljs.exec.mock.calls).toEqual([
      ['git add --all'],
      ['git commit --no-verify -m "Release version 1.1.0."'],
      ['git push --no-verify'],
      ['git tag -a v1.1.0 -m "Release version 1.1.0."'],
      ['git push origin v1.1.0 --no-verify'],
    ]);
  });
});
