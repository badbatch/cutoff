import type { PackageManager } from '../types.js';

export default (packageManager: PackageManager, version: string, tag?: string) => {
  const tagArg = tag ? `--tag ${tag}` : '';

  switch (packageManager) {
    case 'npm':
      return `npm publish ${tagArg}`;

    case 'pnpm':
      return `pnpm publish --no-git-checks ${tagArg}`;

    case 'yarn':
      return `yarn publish --new-version ${version} ${tagArg}`;
  }
};
