import shelljs from 'shelljs';

const { exec } = shelljs;
let lastReleaseTag: string | undefined;

export default () => {
  if (lastReleaseTag) {
    return lastReleaseTag;
  }

  lastReleaseTag = exec('git describe --tags --abbrev=0').stdout;
  return lastReleaseTag;
};
