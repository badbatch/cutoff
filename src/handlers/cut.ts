import { resolve } from 'path';
import type { ReleaseType } from 'semver';
import shelljs from 'shelljs';
import type { PackageJson } from 'type-fest';
import addCommitPushRelease from '../helpers/addCommitPushRelease.js';
import getLastReleaseTag from '../helpers/getLastReleaseTag.js';
import getNewVersion from '../helpers/getNewVersion.js';
import getPackageManager from '../helpers/getPackageManager.js';
import haveFilesChanged from '../helpers/haveFilesChanged.js';
import isProjectMonorepo from '../helpers/isProjectMonorepo.js';
import isValidReleaseTag, { VALID_RELEASE_TAGS } from '../helpers/isValidReleaseTag.js';
import isValidReleaseType, { VALID_RELEASE_TYPES } from '../helpers/isValidReleaseType.js';
import versionMonorepoPackages from '../helpers/versionMonorepoPackages.js';
import versionPackage from '../helpers/versionPackage.js';
import type { CutReleaseArgs, ReleaseTag } from '../types.js';

const { echo, exec, exit } = shelljs;

export default async (argv: CutReleaseArgs) => {
  const dryRun = argv['dry-run'] ?? false;
  const preReleaseId = argv.preid;
  const skipPosthook = argv['skip-posthook'] ?? false;
  const skipPrehook = argv['skip-prehook'] ?? false;
  const tag = argv.tag as ReleaseTag | undefined;
  const type = argv.type as ReleaseType;

  try {
    if (!isValidReleaseType(type)) {
      throw new Error(`Cutoff => Expected type to be a valid release type: ${VALID_RELEASE_TYPES.join(', ')}`);
    }

    if (tag && !isValidReleaseTag(tag)) {
      throw new Error(`Cutoff => Expected tag to be a valid release tag: ${VALID_RELEASE_TAGS.join(', ')}`);
    }

    const packageManager = getPackageManager();

    if (!packageManager) {
      throw new Error(
        `Cutoff => Could not derive the package manager from the lock file in the current working directory.`
      );
    }

    const lastReleaseTag = getLastReleaseTag();

    if (!haveFilesChanged(lastReleaseTag)) {
      throw new Error(`Cutoff => No files have changed since the last release tag: ${lastReleaseTag}`);
    }

    const packageJsonPath = resolve(process.cwd(), 'package.json');
    let packageJson: PackageJson;

    try {
      packageJson = (await import(packageJsonPath)) as PackageJson;
    } catch {
      throw new Error(`Cutoff => Could not resolve the package.json at: ${packageJsonPath}`);
    }

    const { scripts = {}, version } = packageJson;

    if (!version) {
      throw new Error(`Cutoff => Expected the package.json at "${packageJsonPath}" to have a version.`);
    }

    if (!skipPrehook && scripts['cutoff:pre-version']) {
      exec(`${packageManager} run cutoff:pre-version`);
    }

    if (await isProjectMonorepo(packageManager)) {
      await versionMonorepoPackages({ packageManager, preReleaseId, tag, type });
    } else {
      await versionPackage(packageJsonPath, { preReleaseId, tag, type });
    }

    if (!skipPosthook && scripts['cutoff:post-version']) {
      exec(`${packageManager} run cutoff:post-version`);
    }

    if (['patch', 'minor', 'major'].includes(type)) {
      exec(`${packageManager} run changelog --${type}`);
    }

    if (dryRun) {
      return exit(0);
    }

    const newVersion = getNewVersion(version, type, tag, preReleaseId);

    if (!newVersion) {
      throw new Error(`Cutoff => The new project verison for a ${type} increment on ${version} is invalid.`);
    }

    addCommitPushRelease(newVersion);
    return exit(0);
  } catch (err: unknown) {
    echo((err as Error).message);
    return exit(1);
  }
};