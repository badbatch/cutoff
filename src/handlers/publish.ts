import { dim, magenta, red } from 'colorette';
import { resolve } from 'node:path';
import shelljs from 'shelljs';
import { getPackageManager } from '../helpers/getPackageManager.js';
import { isProjectMonorepo } from '../helpers/isProjectMonorepo.js';
import { publishMonorepoPackages } from '../helpers/publishMonorepoPackages.js';
import { publishPackage } from '../helpers/publishPackage.js';

export const publish = () => {
  try {
    const packageManager = getPackageManager();

    if (!packageManager) {
      throw new Error('Could not derive the package manager from the lock file in the current working directory');
    }

    if (isProjectMonorepo(packageManager)) {
      publishMonorepoPackages(packageManager);
    } else {
      const packageJsonPath = resolve(process.cwd(), 'package.json');
      publishPackage(packageJsonPath, { packageManager });
    }

    return shelljs.exit(0);
  } catch (error: unknown) {
    shelljs.echo(`${magenta('Cutoff')} ${dim('=>')} ${red(`Error: ${(error as Error).message}`)}`);
    return shelljs.exit(1);
  }
};
