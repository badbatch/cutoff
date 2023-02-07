import { dim, magenta } from 'colorette';
import shelljs from 'shelljs';
import type { PackageManager } from '../types.js';
import { getMonorepoPackageMeta } from './getMonorepoPackageMeta.js';
import { publishPackage } from './publishPackage.js';

export const publishMonorepoPackages = (packageManager: PackageManager) => {
  const packageMeta = getMonorepoPackageMeta(packageManager);

  for (const name in packageMeta) {
    try {
      const { path } = packageMeta[name]!;
      publishPackage(path, { packageManager });
    } catch (error: unknown) {
      shelljs.echo(`${magenta('Cutoff')} ${dim('=>')} Error publishing ${name}: ${(error as Error).message}`);
    }
  }
};
