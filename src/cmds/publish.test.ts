import shelljs from 'shelljs';

describe('publish', () => {
  it('should return the correct terminal output', () => {
    expect(shelljs.exec('node ./bin/cutoff.mjs publish --help', { silent: true }).stdout).toMatchSnapshot();
  });
});
