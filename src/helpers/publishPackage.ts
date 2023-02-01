import semver from 'semver';
import shelljs from 'shelljs';
import type { ReleaseMeta } from '../types.js';
import { getLatestPackageVersionOnNpm } from './getLatestPackageVersionOnNpm.js';
import { getPublishCmd } from './getPublishCmd.js';
import { getTag } from './getTag.js';
import { loadPackageJson } from './loadPackageJson.js';

export const publishPackage = (packageJsonPath: string, { packageManager }: Pick<ReleaseMeta, 'packageManager'>) => {
  const { name, version } = loadPackageJson(packageJsonPath);
  const latestNpmPackageVersion = getLatestPackageVersionOnNpm(name);

  if (latestNpmPackageVersion === version && !semver.gt(latestNpmPackageVersion, version)) {
    throw new Error(
      `The new ${name} package verison ${version} is less than or equal to the lastest version on NPM: ${latestNpmPackageVersion}`
    );
  }

  const tag = getTag(version);
  shelljs.exec(getPublishCmd(packageManager, version, tag));
};
