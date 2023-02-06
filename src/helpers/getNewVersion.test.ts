describe('getNewVersion', () => {
  describe('when there is a tag and pre release id', () => {
    it('should return the correct new version', async () => {
      const { getNewVersion } = await import('./getNewVersion.js');
      expect(getNewVersion('1.0.0', 'premajor', 'alpha', '12345')).toBe('2.0.0-alpha.12345.0');
    });
  });

  describe('when there is a tag and no pre release id', () => {
    it('should return the correct new version', async () => {
      const { getNewVersion } = await import('./getNewVersion.js');
      expect(getNewVersion('1.0.0', 'premajor', 'alpha')).toBe('2.0.0-alpha.0');
    });
  });

  describe('when there is a no tag or pre release id', () => {
    it('should return the correct new version', async () => {
      const { getNewVersion } = await import('./getNewVersion.js');
      expect(getNewVersion('1.0.0', 'major')).toBe('2.0.0');
    });
  });
});
