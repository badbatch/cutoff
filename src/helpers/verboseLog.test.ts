import { jest } from '@jest/globals';
import { clearShelljsMock, shelljsMock } from '../__testUtils__/shelljs.js';

jest.unstable_mockModule('shelljs', shelljsMock);

describe('verboseLog', () => {
  describe('when verbose is true', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMock(shelljs);

      const { setVerbose } = await import('./verboseLog.js');
      setVerbose(true);
    });

    it('should call echo with the correct message', async () => {
      const { verboseLog } = await import('./verboseLog.js');
      verboseLog('oops');
      expect(shelljs.echo).toHaveBeenCalledWith(expect.stringContaining('oops'));
    });
  });

  describe('when verbose is false', () => {
    let shelljs: jest.MockedObject<typeof import('shelljs')>;

    beforeEach(async () => {
      shelljs = jest.mocked(await import('shelljs')).default;
      clearShelljsMock(shelljs);

      const { setVerbose } = await import('./verboseLog.js');
      setVerbose(false);
    });

    it('should not call echo', async () => {
      const { verboseLog } = await import('./verboseLog.js');
      verboseLog('oops');
      expect(shelljs.echo).not.toHaveBeenCalled();
    });
  });
});
