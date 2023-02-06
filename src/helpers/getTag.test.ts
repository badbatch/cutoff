describe('getTag', () => {
  describe('version includes alpha', () => {
    it('should return alpha', async () => {
      const { getTag } = await import('./getTag.js');
      expect(getTag('1.2.3-alpha')).toBe('alpha');
    });
  });

  describe('version includes beta', () => {
    it('should return beta', async () => {
      const { getTag } = await import('./getTag.js');
      expect(getTag('1.2.3-beta')).toBe('beta');
    });
  });

  describe('version includes unstable', () => {
    it('should return unstable tag', async () => {
      const { getTag } = await import('./getTag.js');
      expect(getTag('1.2.3-unstable233.0')).toBe('unstable233');
    });
  });

  describe('version includes no recognised tag', () => {
    it('should return undefined', async () => {
      const { getTag } = await import('./getTag.js');
      expect(getTag('1.2.3-charlie.0')).toBeUndefined();
    });
  });
});
