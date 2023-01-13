import shelljs from 'shelljs';
import type { PackageManager } from '../types.js';
import getMonorepoPackageJsonPaths from './getMonorepoPackageJsonPaths.js';
import publishPackage from './publishPackage.js';

const { echo } = shelljs;

export default async (packageManager: PackageManager) => {
  const packageJsonPaths = await getMonorepoPackageJsonPaths(packageManager);

  packageJsonPaths.forEach(packageJsonPath => {
    publishPackage(packageJsonPath, { packageManager }).catch((err: Error) => {
      echo(err.message);
    });
  });
};
