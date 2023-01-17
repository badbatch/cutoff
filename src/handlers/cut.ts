import chalk from 'chalk';
import fs from 'fs-extra';
import { resolve } from 'path';
import type { ReleaseType } from 'semver';
import shelljs from 'shelljs';
import type { PackageJson, SetRequired } from 'type-fest';
import addCommitPushRelease from '../helpers/addCommitPushRelease.js';
import formatListLogMessage from '../helpers/formatListLogMessage.js';
import getChangedFiles from '../helpers/getChangedFiles.js';
import getLastReleaseTag from '../helpers/getLastReleaseTag.js';
import getNewVersion from '../helpers/getNewVersion.js';
import getPackageManager from '../helpers/getPackageManager.js';
import haveFilesChanged from '../helpers/haveFilesChanged.js';
import isProjectMonorepo from '../helpers/isProjectMonorepo.js';
import isValidReleaseTag, { VALID_RELEASE_TAGS } from '../helpers/isValidReleaseTag.js';
import isValidReleaseType, { VALID_RELEASE_TYPES } from '../helpers/isValidReleaseType.js';
import verboseLog, { isVerbose } from '../helpers/verboseLog.js';
import versionMonorepoPackages from '../helpers/versionMonorepoPackages.js';
import versionPackage from '../helpers/versionPackage.js';
import type { CutReleaseArgs, ReleaseTag } from '../types.js';

const { outputFileSync, readFileSync } = fs;
const { echo, exec, exit } = shelljs;

export default (argv: CutReleaseArgs) => {
  const dryRun = argv['dry-run'] ?? false;
  const force = argv.force ?? false;
  const preReleaseId = argv.preid;
  const skipPosthook = argv['skip-posthook'] ?? false;
  const skipPrehook = argv['skip-prehook'] ?? false;
  const tag = argv.tag as ReleaseTag | undefined;
  const type = argv.type as ReleaseType;
  const verbose = argv.verbose ?? false;

  isVerbose(verbose);
  verboseLog('>>>> USER CONFIG START <<<<');
  verboseLog(`dryRun: ${String(dryRun)}`);
  verboseLog(`force: ${String(force)}`);
  verboseLog(`preReleaseId: ${preReleaseId ?? 'undefined'}`);
  verboseLog(`skipPosthook: ${String(skipPosthook)}`);
  verboseLog(`skipPrehook: ${String(skipPrehook)}`);
  verboseLog(`tag: ${tag ?? 'undefined'}`);
  verboseLog(`type: ${type}`);
  verboseLog('>>>> USER CONFIG END <<<<\n');

  try {
    if (!isValidReleaseType(type)) {
      throw new Error(`Expected type to be a valid release type: ${VALID_RELEASE_TYPES.join(', ')}`);
    }

    if (tag && !isValidReleaseTag(tag)) {
      throw new Error(`Expected tag to be a valid release tag: ${VALID_RELEASE_TAGS.join(', ')}`);
    }

    const packageManager = getPackageManager();

    if (!packageManager) {
      throw new Error(
        `Cutoff => Could not derive the package manager from the lock file in the current working directory.`
      );
    }

    const lastReleaseTag = getLastReleaseTag();
    verboseLog('>>>> DERIVED VALUES START <<<<');
    verboseLog(`PackageManager: ${packageManager}`);
    verboseLog(`lastReleaseTag: ${lastReleaseTag}`);
    const filesChanged = haveFilesChanged(lastReleaseTag);

    if (!force && !filesChanged) {
      throw new Error(`No files have changed since the last release tag: ${lastReleaseTag}`);
    }

    verboseLog(`haveFilesChanged: ${String(filesChanged)}`);
    verboseLog('>>>> DERIVED VALUES END <<<<\n');
    verboseLog('>>>> PROJECT ROOT START <<<<');
    const packageJsonPath = resolve(process.cwd(), 'package.json');
    verboseLog(`Reading packageJson at: ${packageJsonPath}`);
    let packageJson: PackageJson;

    try {
      packageJson = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf8' })) as PackageJson;
    } catch (err: unknown) {
      verboseLog(`packageJson read error: ${(err as Error).name}, ${(err as Error).message}`);
      throw new Error(`Could not resolve the package.json at: ${packageJsonPath}`);
    }

    const { name, scripts = {}, version } = packageJson;

    if (!name) {
      throw new Error(`Expected the package.json at "${packageJsonPath}" to have a name.`);
    }

    if (!version) {
      throw new Error(`Expected the package.json at "${packageJsonPath}" to have a version.`);
    }

    verboseLog(`${name} packageJson imported with version ${version}`);

    if (!skipPrehook && scripts['cutoff:pre-version']) {
      verboseLog(`Running cutoff:pre-version script: ${scripts['cutoff:pre-version']}`);
      exec(`${packageManager} run cutoff:pre-version`);
    } else if (skipPrehook && scripts['cutoff:pre-version']) {
      verboseLog(`cutoff:pre-version script skipped, skipPrehook set to true`);
    } else if (!scripts['cutoff:pre-version']) {
      verboseLog(`cutoff:pre-version script not provided`);
    }

    if (isProjectMonorepo(packageManager)) {
      verboseLog('Project is monorepo');
      versionMonorepoPackages({ force, packageManager, preReleaseId, tag, type });
      verboseLog('>>>> PROJECT ROOT STARTS <<<<\n');
    } else {
      verboseLog('Project is standard repo structure');
      const changedFiles = getChangedFiles(lastReleaseTag);
      verboseLog(formatListLogMessage('Project changedFiles', changedFiles));

      versionPackage(packageJson as SetRequired<PackageJson, 'name' | 'version'>, {
        packageJsonPath,
        preReleaseId,
        tag,
        type,
      });
    }

    if (!skipPosthook && scripts['cutoff:post-version']) {
      verboseLog(`Running cutoff:post-version script: ${scripts['cutoff:post-version']}`);
      exec(`${packageManager} run cutoff:post-version`);
    } else if (skipPosthook && scripts['cutoff:post-version']) {
      verboseLog(`cutoff:post-version skipped, skipPosthook set to true`);
    } else if (!scripts['cutoff:post-version']) {
      verboseLog(`cutoff:post-version script not provided`);
    }

    if (['patch', 'minor', 'major'].includes(type)) {
      verboseLog(`Generating changelog for ${type} release`);
      exec(`${packageManager} run changelog -- --${type}`);
    }

    const newVersion = getNewVersion(version, type, tag, preReleaseId);

    if (!newVersion) {
      throw new Error(`The new project verison for a ${type} increment on ${version} is invalid.`);
    }

    verboseLog(`release newVersion: ${newVersion}`);

    if (isProjectMonorepo(packageManager)) {
      try {
        verboseLog(`Outputting project packageJson with new version: ${newVersion}`);
        outputFileSync(packageJsonPath, JSON.stringify({ ...packageJson, version: newVersion }, null, 2));
      } catch (err: unknown) {
        verboseLog(`packageJson output error: ${(err as Error).name}, ${(err as Error).message}`);
        throw new Error(`Could not write the package.json to: ${packageJsonPath}`);
      }
    }

    if (dryRun) {
      verboseLog('Exiting process as dry-run set to true');
      verboseLog('>>>> PROJECT ROOT END <<<<\n');
      return exit(0);
    }

    verboseLog(`Adding, committing and pushing new version: ${newVersion}`);
    addCommitPushRelease(newVersion);
    verboseLog('>>>> PROJECT ROOT END <<<<\n');
    return exit(0);
  } catch (err: unknown) {
    echo(`${chalk.magenta('Cutoff')} ${chalk.dim('=>')} ${chalk.red(`Error: ${(err as Error).message}`)}`);
    verboseLog('>>>> PROJECT ROOT END <<<<\n');
    return exit(1);
  }
};
