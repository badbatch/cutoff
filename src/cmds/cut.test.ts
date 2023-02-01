import shelljs from 'shelljs';

describe('cut', () => {
  it('should return the correct terminal output', () => {
    expect(shelljs.exec('node ./bin/cutoff.mjs cut --help', { silent: true }).stdout).toMatchSnapshot();
  });
});
