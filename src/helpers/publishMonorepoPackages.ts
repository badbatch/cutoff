import { dim, magenta } from 'colorette';
import shelljs from 'shelljs';
import type { PackageManager } from '../types.js';
import { getMonorepoPackageMeta } from './getMonorepoPackageMeta.js';
import { publishPackage } from './publishPackage.js';

export const publishMonorepoPackages = (packageManager: PackageManager) => {
  const packagePaths = getMonorepoPackageMeta(packageManager);

  for (const packageJsonPath of Object.keys(packagePaths)) {
    try {
      publishPackage(packageJsonPath, { packageManager });
    } catch (error: unknown) {
      shelljs.echo(`${magenta('Cutoff')} ${dim('=>')} ${(error as Error).message}`);
    }
  }
};
