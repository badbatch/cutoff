import shelljs from 'shelljs';

let lastReleaseTag: string | undefined;

export const getLastReleaseTag = () => {
  if (lastReleaseTag) {
    return lastReleaseTag;
  }

  lastReleaseTag = shelljs.exec('git describe --tags --abbrev=0', { silent: true }).stdout.trim();
  return lastReleaseTag;
};
