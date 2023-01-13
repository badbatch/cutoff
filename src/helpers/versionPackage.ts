import fs from 'fs-extra';
import semver from 'semver';
import type { PackageJson } from 'type-fest';
import type { ReleaseMeta } from '../types.js';
import getLastestPackageVersionOnNpm from './getLastestPackageVersionOnNpm.js';
import getNewVersion from './getNewVersion.js';

const { outputFileSync, readFileSync } = fs;
const { gt } = semver;

export default (
  packageJsonPath: string,
  { preReleaseId, tag, type }: Pick<ReleaseMeta, 'preReleaseId' | 'tag' | 'type'>,
  verboseLog?: (msg: string) => void
) => {
  let packageJson: PackageJson;

  try {
    packageJson = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf8' })) as PackageJson;
  } catch (err: unknown) {
    verboseLog?.(`packageJson read error: ${(err as Error).name}, ${(err as Error).message}`);
    throw new Error(`Cutoff => Could not resolve the package.json at: ${packageJsonPath}`);
  }

  const { name, version } = packageJson;

  if (!name) {
    throw new Error(`Cutoff => Expected the package.json at "${packageJsonPath}" to have a name.`);
  }

  if (!version) {
    throw new Error(`Cutoff => Expected the package.json at "${packageJsonPath}" to have a version.`);
  }

  const newVersion = getNewVersion(version, type, tag, preReleaseId);

  if (!newVersion) {
    throw new Error(`Cutoff => The new package verison for a ${type} increment on ${version} is invalid.`);
  }

  const latestNpmPackageVersion = getLastestPackageVersionOnNpm(name);

  if (latestNpmPackageVersion === newVersion && !gt(latestNpmPackageVersion, newVersion)) {
    throw new Error(
      `Cutoff => The new ${name} package verison ${newVersion} is less than or equal to the lastest version on NPM: ${latestNpmPackageVersion}`
    );
  }

  try {
    outputFileSync(packageJsonPath, JSON.stringify({ ...packageJson, version: newVersion }, null, 2));
  } catch (err: unknown) {
    verboseLog?.(`packageJson output error: ${(err as Error).name}, ${(err as Error).message}`);
    throw new Error(`Cutoff => Could not write the package.json to: ${packageJsonPath}`);
  }
};
