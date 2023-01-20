import shelljs from 'shelljs';

const { exec } = shelljs;

describe('publish', () => {
  it('should return the correct terminal output', () => {
    expect(exec('node --trace-warnings ./bin/cutoff.mjs publish --help', { silent: true }).stdout).toMatchSnapshot();
  });
});
