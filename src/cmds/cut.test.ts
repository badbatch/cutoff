import shelljs from 'shelljs';

const { exec } = shelljs;

describe('cut', () => {
  it('should return the correct terminal output', () => {
    expect(exec('node --trace-warnings ./bin/cutoff.mjs cut --help', { silent: true }).stdout).toMatchSnapshot();
  });
});
