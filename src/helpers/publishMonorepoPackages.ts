import { dim, magenta } from 'colorette';
import shelljs from 'shelljs';
import type { PackageManager } from '../types.js';
import { getMonorepoPackageMeta } from './getMonorepoPackageMeta.js';
import { publishPackage } from './publishPackage.js';

const { echo } = shelljs;

export const publishMonorepoPackages = (packageManager: PackageManager) => {
  const packagePaths = getMonorepoPackageMeta(packageManager);

  Object.keys(packagePaths).forEach(packageJsonPath => {
    try {
      publishPackage(packageJsonPath, { packageManager });
    } catch (err: unknown) {
      echo(`${magenta('Cutoff')} ${dim('=>')} ${(err as Error).message}`);
    }
  });
};
