import fs from 'fs-extra';
import { load } from 'js-yaml';
import type { LoadOptions } from 'js-yaml';
import { resolve } from 'node:path';
import type { PackageManager, PnpmWorkspaceYaml } from '../types.js';
import { loadPackageJson } from './loadPackageJson.js';

const { readFileSync } = fs;

export const isProjectMonorepo = (packageManager: PackageManager) => {
  try {
    switch (packageManager) {
      case 'npm':

      // eslint-disable-next-line no-fallthrough
      case 'yarn': {
        const packageJsonPath = resolve(process.cwd(), 'package.json');
        const packageJson = loadPackageJson(packageJsonPath);

        if (!packageJson.workspaces) {
          return false;
        }

        return Array.isArray(packageJson.workspaces)
          ? packageJson.workspaces.length > 0
          : !!packageJson.workspaces.packages?.length;
      }

      case 'pnpm': {
        const pnpmWorkspaceYamlPath = resolve(process.cwd(), 'pnpm-workspace.yaml');
        const typedLoad = load as (path: string, options?: LoadOptions) => unknown;

        const pnpmWorkspaceYaml = typedLoad(
          readFileSync(pnpmWorkspaceYamlPath, { encoding: 'utf8' })
        ) as PnpmWorkspaceYaml;

        return Array.isArray(pnpmWorkspaceYaml.packages) && pnpmWorkspaceYaml.packages.length > 0;
      }
    }
  } catch {
    return false;
  }
};
