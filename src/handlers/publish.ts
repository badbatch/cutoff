import { resolve } from 'path';
import shelljs from 'shelljs';
import getPackageManager from '../helpers/getPackageManager.js';
import isProjectMonorepo from '../helpers/isProjectMonorepo.js';
import publishMonorepoPackages from '../helpers/publishMonorepoPackages.js';
import publishPackage from '../helpers/publishPackage.js';

const { echo, exit } = shelljs;

export default () => {
  try {
    const packageManager = getPackageManager();

    if (!packageManager) {
      throw new Error(
        `Cutoff => Could not derive the package manager from the lock file in the current working directory.`
      );
    }

    if (isProjectMonorepo(packageManager)) {
      publishMonorepoPackages(packageManager);
    } else {
      const packageJsonPath = resolve(process.cwd(), 'package.json');
      publishPackage(packageJsonPath, { packageManager });
    }

    return exit(0);
  } catch (err: unknown) {
    echo((err as Error).message);
    return exit(1);
  }
};
