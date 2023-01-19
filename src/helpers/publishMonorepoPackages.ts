import chalk from 'chalk';
import shelljs from 'shelljs';
import type { PackageManager } from '../types.js';
import getMonorepoPackagePaths from './getMonorepoPackageMeta.js';
import publishPackage from './publishPackage.js';

const { echo } = shelljs;

export default (packageManager: PackageManager) => {
  const packagePaths = getMonorepoPackagePaths(packageManager);

  Object.keys(packagePaths).forEach(packageJsonPath => {
    try {
      publishPackage(packageJsonPath, { packageManager });
    } catch (err: unknown) {
      echo(`${chalk.magenta('Cutoff')} ${chalk.dim('=>')} ${(err as Error).message}`);
    }
  });
};
