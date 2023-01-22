import { dim, magenta, red } from 'colorette';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ReleaseType } from 'semver';
import shelljs from 'shelljs';
import { addCommitPushRelease } from '../helpers/addCommitPushRelease.js';
import { formatListLogMessage } from '../helpers/formatListLogMessage.js';
import { getChangedFiles } from '../helpers/getChangedFiles.js';
import { getLastReleaseTag } from '../helpers/getLastReleaseTag.js';
import { getNewVersion } from '../helpers/getNewVersion.js';
import { getPackageManager } from '../helpers/getPackageManager.js';
import { haveFilesChanged } from '../helpers/haveFilesChanged.js';
import { isProjectMonorepo } from '../helpers/isProjectMonorepo.js';
import { VALID_RELEASE_TAGS, isValidReleaseTag } from '../helpers/isValidReleaseTag.js';
import { VALID_RELEASE_TYPES, isValidReleaseType } from '../helpers/isValidReleaseType.js';
import { loadPackageJson } from '../helpers/loadPackageJson.js';
import { isVerbose, verboseLog } from '../helpers/verboseLog.js';
import { versionMonorepoPackages } from '../helpers/versionMonorepoPackages.js';
import { versionPackage } from '../helpers/versionPackage.js';
import type { CutReleaseArguments, ReleaseTag } from '../types.js';

const { echo, exec, exit } = shelljs;

export const cut = (argv: CutReleaseArguments) => {
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
      throw new Error('Could not derive the package manager from the lock file in the current working directory');
    }

    const lastReleaseTag = getLastReleaseTag();
    verboseLog('>>>> DERIVED VALUES START <<<<');
    verboseLog(`Package manager: ${packageManager}`);
    verboseLog(`Last release tag: ${lastReleaseTag}`);
    const filesChanged = haveFilesChanged(lastReleaseTag);

    if (!force && !filesChanged) {
      throw new Error(`No files have changed since the last release tag: ${lastReleaseTag}`);
    }

    verboseLog(`Have files changed: ${String(filesChanged)}`);
    verboseLog('>>>> DERIVED VALUES END <<<<\n');
    verboseLog('>>>> PROJECT ROOT START <<<<');
    const packageJsonPath = resolve(process.cwd(), 'package.json');
    const packageJson = loadPackageJson(packageJsonPath);
    const { scripts = {}, version } = packageJson;

    if (!skipPrehook && scripts['cutoff:pre-version']) {
      verboseLog(`Running cutoff:pre-version script: ${scripts['cutoff:pre-version']}\n`);
      exec(`${packageManager} run cutoff:pre-version`);
      echo('\n');
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
      verboseLog(formatListLogMessage('Project changed files', changedFiles));

      versionPackage(packageJson, {
        packageJsonPath,
        preReleaseId,
        tag,
        type,
      });
    }

    if (!skipPosthook && scripts['cutoff:post-version']) {
      verboseLog(`Running cutoff:post-version script: ${scripts['cutoff:post-version']}\n`);
      exec(`${packageManager} run cutoff:post-version`);
      echo('\n');
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

    verboseLog(`Release new version: ${newVersion}`);

    if (isProjectMonorepo(packageManager)) {
      try {
        verboseLog(`Outputting project packageJson with new version: ${newVersion}`);
        writeFileSync(packageJsonPath, JSON.stringify({ ...packageJson, version: newVersion }, undefined, 2));
      } catch (error: unknown) {
        verboseLog(`Package.json output error: ${(error as Error).name}, ${(error as Error).message}`);
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
  } catch (error: unknown) {
    echo(`${magenta('Cutoff')} ${dim('=>')} ${red(`Error: ${(error as Error).message}`)}`);
    verboseLog('>>>> PROJECT ROOT END <<<<\n');
    return exit(1);
  }
};
