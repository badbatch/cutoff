import fs from 'fs-extra';
import semver from 'semver';
import type { PackageJson, SetRequired } from 'type-fest';
import type { ReleaseMeta } from '../types.js';
import { getLatestPackageVersionOnNpm } from './getLatestPackageVersionOnNpm.js';
import { getNewVersion } from './getNewVersion.js';
import { verboseLog } from './verboseLog.js';

const { outputFileSync } = fs;
const { gt } = semver;

export const versionPackage = (
  packageJson: SetRequired<PackageJson, 'name' | 'version'>,
  { packageJsonPath, preReleaseId, tag, type }: Pick<ReleaseMeta, 'packageJsonPath' | 'preReleaseId' | 'tag' | 'type'>
) => {
  const { name, version } = packageJson;
  verboseLog(`Current version: ${version}`);
  const newVersion = getNewVersion(version, type, tag, preReleaseId);

  if (!newVersion) {
    throw new Error(`The new package verison for a ${type} increment on ${version} is invalid.`);
  }

  const latestNpmPackageVersion = getLatestPackageVersionOnNpm(name);
  verboseLog(`New version: ${newVersion}`);
  verboseLog(`Latest version on npm: ${latestNpmPackageVersion}`);

  if (latestNpmPackageVersion === newVersion && !gt(latestNpmPackageVersion, newVersion)) {
    throw new Error(
      `The new package verison ${newVersion} is less than or equal to the lastest version ${latestNpmPackageVersion} on npm`
    );
  }

  try {
    verboseLog(`Outputting package.json with new version: ${newVersion}`);
    outputFileSync(packageJsonPath, JSON.stringify({ ...packageJson, version: newVersion }, null, 2));
  } catch (err: unknown) {
    verboseLog(`Package.json output error: ${(err as Error).name}, ${(err as Error).message}`);
    throw new Error(`Could not write the package.json to: ${packageJsonPath}`);
  }
};
