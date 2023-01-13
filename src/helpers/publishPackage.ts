import semver from 'semver';
import shelljs from 'shelljs';
import type { PackageJson } from 'type-fest';
import type { ReleaseMeta } from '../types.js';
import getLastestPackageVersionOnNpm from './getLastestPackageVersionOnNpm.js';
import getPublishCmd from './getPublishCmd.js';
import getTag from './getTag.js';

const { gt } = semver;
const { exec } = shelljs;

export default async (packageJsonPath: string, { packageManager }: Pick<ReleaseMeta, 'packageManager'>) => {
  let packageJson: PackageJson;

  try {
    packageJson = (await import(packageJsonPath)) as PackageJson;
  } catch {
    throw new Error(`Cutoff => Could not resolve the package.json at: ${packageJsonPath}`);
  }

  const { name, version } = packageJson;

  if (!name) {
    throw new Error(`Cutoff => Expected the package.json at "${packageJsonPath}" to have a name.`);
  }

  if (!version) {
    throw new Error(`Cutoff => Expected the package.json at "${packageJsonPath}" to have a version.`);
  }

  const latestNpmPackageVersion = getLastestPackageVersionOnNpm(name);

  if (latestNpmPackageVersion === version && !gt(latestNpmPackageVersion, version)) {
    throw new Error(
      `Cutoff => The new ${name} package verison ${version} is less than or equal to the lastest version on NPM: ${latestNpmPackageVersion}`
    );
  }

  const tag = getTag(version);
  exec(getPublishCmd(packageManager, version, tag));
};
