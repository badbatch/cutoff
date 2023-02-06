import shelljs from 'shelljs';

let lastReleaseTag: string | undefined;

export const addLastReleaseTagToCache = (releaseTag: string) => {
  lastReleaseTag = releaseTag;
};

export const clearLastReleaseTagCache = () => {
  lastReleaseTag = undefined;
};

export const getCachedLastReleaseTag = () => {
  return lastReleaseTag;
};

export const getLastReleaseTag = () => {
  if (lastReleaseTag) {
    return lastReleaseTag;
  }

  lastReleaseTag = shelljs.exec('git describe --tags --abbrev=0', { silent: true }).stdout.trim();
  return lastReleaseTag;
};
