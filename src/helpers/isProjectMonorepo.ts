import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import type { LoadOptions } from 'js-yaml';
import { resolve } from 'path';
import type { PackageJson } from 'type-fest';
import type { PackageManager, PnpmWorkspaceYaml } from '../types.js';

export default async (packageManager: PackageManager) => {
  try {
    switch (packageManager) {
      case 'npm':

      // eslint-disable-next-line no-fallthrough
      case 'yarn': {
        const packageJsonPath = resolve(process.cwd(), 'package.json');
        const packageJson = (await import(packageJsonPath)) as PackageJson;

        if (!packageJson.workspaces) {
          return false;
        }

        return Array.isArray(packageJson.workspaces)
          ? !!packageJson.workspaces.length
          : !!packageJson.workspaces.packages?.length;
      }

      case 'pnpm': {
        const pnpmWorkspaceYamlPath = resolve(process.cwd(), 'pnpm-workspace.yaml');
        const typedLoad = load as (str: string, opts?: LoadOptions) => unknown;

        const pnpmWorkspaceYaml = typedLoad(
          readFileSync(pnpmWorkspaceYamlPath, { encoding: 'utf8' })
        ) as PnpmWorkspaceYaml;

        return Array.isArray(pnpmWorkspaceYaml.packages) && !!pnpmWorkspaceYaml.packages.length;
      }
    }
  } catch {
    return false;
  }
};
