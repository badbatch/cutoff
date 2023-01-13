import fs from 'fs-extra';
import { resolve } from 'path';
import type { PackageManager } from '../types.js';

const { pathExistsSync } = fs;

export default (): PackageManager | undefined => {
  switch (true) {
    case pathExistsSync(resolve(process.cwd(), 'package-lock.json')):
      return 'npm';

    case pathExistsSync(resolve(process.cwd(), 'pnpm-lock.yaml')):
      return 'pnpm';

    case pathExistsSync(resolve(process.cwd(), 'yarn.lock')):
      return 'yarn';

    default:
      return undefined;
  }
};
