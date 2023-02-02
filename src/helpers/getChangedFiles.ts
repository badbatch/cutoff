import shelljs from 'shelljs';

let cachedChangedFiles: string[] | undefined;

export const addChangedFilesToCache = (files: string[]) => {
  cachedChangedFiles = [...(cachedChangedFiles ?? []), ...files];
};

export const clearChangedFilesCache = () => {
  cachedChangedFiles = undefined;
};

export const getCachedChangedFiles = () => {
  return cachedChangedFiles;
};

export const getChangedFiles = (releaseTag: string) => {
  if (cachedChangedFiles) {
    return cachedChangedFiles;
  }

  cachedChangedFiles = shelljs
    .exec(`git diff --name-only HEAD ${releaseTag}`, { silent: true })
    .stdout.trim()
    .split('\n')
    .filter(value => !!value);

  return cachedChangedFiles;
};
