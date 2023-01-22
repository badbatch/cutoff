import type { PackageManager } from '../types.js';

export const getPublishCmd = (packageManager: PackageManager, version: string, tag?: string) => {
  const tagArgument = tag ? `--tag ${tag}` : '';

  switch (packageManager) {
    case 'npm': {
      return `npm publish ${tagArgument}`;
    }

    case 'pnpm': {
      return `pnpm publish --no-git-checks ${tagArgument}`;
    }

    case 'yarn': {
      return `yarn publish --new-version ${version} ${tagArgument}`;
    }
  }
};
