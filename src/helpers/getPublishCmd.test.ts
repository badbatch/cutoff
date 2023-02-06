describe('getPublishCmd', () => {
  describe('when package manager is npm', () => {
    it('should return the correct command', async () => {
      const { getPublishCmd } = await import('./getPublishCmd.js');
      expect(getPublishCmd('npm', '1.1.0')).toBe('npm publish');
    });
  });

  describe('when package manager is yarn', () => {
    it('should return the correct command', async () => {
      const { getPublishCmd } = await import('./getPublishCmd.js');
      expect(getPublishCmd('yarn', '1.1.0')).toBe('yarn publish --new-version 1.1.0');
    });
  });

  describe('when package manager is pnpm', () => {
    it('should return the correct command', async () => {
      const { getPublishCmd } = await import('./getPublishCmd.js');
      expect(getPublishCmd('pnpm', '1.1.0')).toBe('pnpm publish --no-git-checks');
    });
  });

  describe('when publish command includes tag', () => {
    it('should return the correct command', async () => {
      const { getPublishCmd } = await import('./getPublishCmd.js');
      expect(getPublishCmd('npm', '1.1.0', 'alpha')).toBe('npm publish --tag alpha');
    });
  });
});
