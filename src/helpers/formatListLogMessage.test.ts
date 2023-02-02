describe('formatListLogMessage', () => {
  describe('when there are no field values', () => {
    it('should format the message correctly', async () => {
      const { formatListLogMessage } = await import('./formatListLogMessage.js');
      expect(formatListLogMessage('fieldName', [])).toBe('fieldName: None');
    });
  });

  describe('when there are field values', () => {
    it('should format the message correctly', async () => {
      const { formatListLogMessage } = await import('./formatListLogMessage.js');
      const message = formatListLogMessage('fieldName', ['alpha', 'bravo', 'charlie']);
      expect(message).toBe('fieldName:\n          [2m>[22m alpha\n          [2m>[22m bravo\n          [2m>[22m charlie');
    });
  });
});
