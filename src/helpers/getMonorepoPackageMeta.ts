import type { PackageManager, PackageMetaRecord } from '../types.js';
import { getMonorepoPackageJsonPaths } from './getMonorepoPackageJsonPaths.js';
import { loadPackageJson } from './loadPackageJson.js';

export const getMonorepoPackageMeta = (packageManager: PackageManager) => {
  const packageJsonPaths = getMonorepoPackageJsonPaths(packageManager);
  const packageMetaRecord: PackageMetaRecord = {};

  for (const packageJsonPath of packageJsonPaths) {
    const { name } = loadPackageJson(packageJsonPath);

    packageMetaRecord[name] = {
      name,
      path: packageJsonPath,
    };
  }

  return packageMetaRecord;
};
