import { jest } from '@jest/globals';

jest.unstable_mockModule('shelljs', () => ({
  default: {
    echo: jest.fn(),
    exec: jest.fn(),
    exit: jest.fn(),
  },
}));

describe('cut', () => {
  describe('when release type is not valid', () => {
    const setupTest = async () => {
      const { default: shelljs } = jest.mocked(await import('shelljs'));
      const { cut } = await import('./cut.js');
      cut({ type: 'blah' });
      return shelljs;
    };

    it('should log the correct error message', async () => {
      const { echo } = await setupTest();

      expect(echo).toHaveBeenCalledWith(
        expect.stringContaining(
          'Error: Expected type to be a valid release type: major, premajor, minor, preminor, patch, prepatch, prerelease'
        )
      );
    });

    it('should exit with the correct code', async () => {
      const { exit } = await setupTest();
      expect(exit).toHaveBeenCalledWith(1);
    });
  });
});
