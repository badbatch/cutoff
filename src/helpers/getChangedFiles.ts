import shelljs from 'shelljs';

const { exec } = shelljs;
let cachedChangedFiles: string[] | undefined;

export default (releaseTag: string) => {
  if (cachedChangedFiles) {
    return cachedChangedFiles;
  }

  cachedChangedFiles = exec(`git diff --name-only HEAD ${releaseTag}`, { silent: true })
    .stdout.trim()
    .split('\n')
    .filter(val => !!val);

  return cachedChangedFiles;
};
