import fs from 'fs-extra';
import type { PackageJson, SetRequired } from 'type-fest';
import { verboseLog } from './verboseLog.js';

const { readFileSync } = fs;
const packageJsonCache: Record<string, SetRequired<PackageJson, 'name' | 'version'>> = {};

export const loadPackageJson = (packageJsonPath: string) => {
  const cachedPackageJson = packageJsonCache[packageJsonPath];

  if (cachedPackageJson) {
    return cachedPackageJson;
  }

  let packageJson: PackageJson;

  try {
    packageJson = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf8' })) as PackageJson;
  } catch (err: unknown) {
    verboseLog(`Package.json read error: ${(err as Error).name}, ${(err as Error).message}`);
    throw new Error(`Could not resolve the package.json at: ${packageJsonPath}`);
  }

  const { name, version } = packageJson;

  if (!name) {
    throw new Error(`Expected the package.json at "${packageJsonPath}" to have a name`);
  }

  if (!version) {
    throw new Error(`Expected the package.json at "${packageJsonPath}" to have a version.`);
  }

  const validatedPackageJson = packageJson as SetRequired<PackageJson, 'name' | 'version'>;
  packageJsonCache[packageJsonPath] = validatedPackageJson;
  return validatedPackageJson;
};
