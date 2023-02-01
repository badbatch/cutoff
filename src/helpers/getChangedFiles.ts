import shelljs from 'shelljs';

let cachedChangedFiles: string[] | undefined;

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
