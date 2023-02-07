import { writeFileSync } from 'node:fs';
import semver from 'semver';
import type { PackageJson, SetRequired } from 'type-fest';
import type { ReleaseMeta } from '../types.js';
import { getLatestPackageVersionOnNpm } from './getLatestPackageVersionOnNpm.js';
import { getNewVersion } from './getNewVersion.js';
import { verboseLog } from './verboseLog.js';

export const versionPackage = (
  packageJson: SetRequired<PackageJson, 'name' | 'version'>,
  { packageJsonPath, preReleaseId, tag, type }: Pick<ReleaseMeta, 'packageJsonPath' | 'preReleaseId' | 'tag' | 'type'>
) => {
  const { name, version } = packageJson;
  verboseLog(`Current version: ${version}`);
  const newVersion = getNewVersion(version, type, tag, preReleaseId);

  if (!newVersion) {
    throw new Error(`The new package verison for a ${type} increment on ${version} is invalid`);
  }

  const latestNpmPackageVersion = getLatestPackageVersionOnNpm(name);
  verboseLog(`New version: ${newVersion}`);
  verboseLog(`Latest version on npm: ${latestNpmPackageVersion}`);

  if (newVersion === latestNpmPackageVersion || semver.lt(newVersion, latestNpmPackageVersion)) {
    throw new Error(
      `The new package verison ${newVersion} is less than or equal to the lastest version ${latestNpmPackageVersion} on npm`
    );
  }

  try {
    verboseLog(`Outputting package.json with new version: ${newVersion}`);
    writeFileSync(packageJsonPath, JSON.stringify({ ...packageJson, version: newVersion }, undefined, 2));
  } catch (error: unknown) {
    verboseLog(`Package.json output error: ${(error as Error).name}, ${(error as Error).message}`);
    throw new Error(`Could not write the package.json to: ${packageJsonPath}`);
  }
};
