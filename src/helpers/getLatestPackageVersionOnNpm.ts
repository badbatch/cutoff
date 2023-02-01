import shelljs from 'shelljs';

export const getLatestPackageVersionOnNpm = (name: string) =>
  shelljs.exec(`npm view ${name} version`, { silent: true }).stdout.trim();
