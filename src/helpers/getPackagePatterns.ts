import { load } from 'js-yaml';
import type { LoadOptions } from 'js-yaml';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { PackageManager, PnpmWorkspaceYaml } from '../types.js';
import { loadPackageJson } from './loadPackageJson.js';

export const getPackagePatterns = (packageManager: PackageManager) => {
  try {
    switch (packageManager) {
      case 'npm':

      // eslint-disable-next-line no-fallthrough
      case 'yarn': {
        const packageJsonPath = resolve(process.cwd(), 'package.json');
        const packageJson = loadPackageJson(packageJsonPath);

        if (!packageJson.workspaces) {
          return [];
        }

        return (Array.isArray(packageJson.workspaces) ? packageJson.workspaces : packageJson.workspaces.packages) ?? [];
      }

      case 'pnpm': {
        const pnpmWorkspaceYamlPath = resolve(process.cwd(), 'pnpm-workspace.yaml');
        const typedLoad = load as (path: string, options?: LoadOptions) => unknown;

        const pnpmWorkspaceYaml = typedLoad(
          readFileSync(pnpmWorkspaceYamlPath, { encoding: 'utf8' })
        ) as PnpmWorkspaceYaml;

        return pnpmWorkspaceYaml.packages;
      }
    }
  } catch {
    return [];
  }
};
