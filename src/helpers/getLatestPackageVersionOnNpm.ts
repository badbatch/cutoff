import shelljs from 'shelljs';

const { exec } = shelljs;

export const getLatestPackageVersionOnNpm = (name: string) =>
  exec(`npm view ${name} version`, { silent: true }).stdout.trim();
