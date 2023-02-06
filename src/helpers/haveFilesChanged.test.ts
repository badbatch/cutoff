import { jest } from '@jest/globals';

jest.unstable_mockModule('./getChangedFiles.js', () => ({
  getChangedFiles: jest.fn().mockReturnValue([]),
}));

describe('haveFilesChanged', () => {
  describe('when the number of changed files is greater than 0', () => {
    beforeEach(async () => {
      const { getChangedFiles } = await import('./getChangedFiles.js');
      const mockedGetChangedFiles = jest.mocked(getChangedFiles);
      mockedGetChangedFiles.mockClear();
      mockedGetChangedFiles.mockReturnValueOnce(['.editorconfig', '.gitignore', 'package.json', 'pnpm-lock.yaml']);
    });

    it('should return true', async () => {
      const { haveFilesChanged } = await import('./haveFilesChanged.js');
      expect(haveFilesChanged('v1.1.0')).toBe(true);
    });
  });

  describe('when the number of changed files is 0', () => {
    beforeEach(async () => {
      const { getChangedFiles } = await import('./getChangedFiles.js');
      const mockedGetChangedFiles = jest.mocked(getChangedFiles);
      mockedGetChangedFiles.mockClear();
    });

    it('should return false', async () => {
      const { haveFilesChanged } = await import('./haveFilesChanged.js');
      expect(haveFilesChanged('v1.1.0')).toBe(false);
    });
  });
});
