import chalk from 'chalk';
import { parse } from 'path';
import shell from 'shelljs';
import type { ReleaseMeta } from '../types.js';
import formatListLogMessage from './formatListLogMessage.js';
import getChangedFiles from './getChangedFiles.js';
import getInternalDepsPackageMeta from './getInternalDepsPackageMeta.js';
import getLastReleaseTag from './getLastReleaseTag.js';
import getMonorepoPackageMeta from './getMonorepoPackageMeta.js';
import loadPackageJson from './loadPackageJson.js';
import verboseLog from './verboseLog.js';
import versionPackage from './versionPackage.js';

const { echo } = shell;

export default ({
  force,
  packageManager,
  preReleaseId,
  tag,
  type,
}: Pick<ReleaseMeta, 'force' | 'packageManager' | 'preReleaseId' | 'tag' | 'type'>) => {
  const packageMetaRecord = getMonorepoPackageMeta(packageManager);
  const lastReleaseTag = getLastReleaseTag();
  const changedFiles = getChangedFiles(lastReleaseTag);
  const cwd = process.cwd();
  verboseLog(formatListLogMessage('Project changed files', changedFiles));
  verboseLog(`Project last release tag: ${lastReleaseTag}`);
  verboseLog('Versioning monorepo packages');
  verboseLog('>>>> PROJECT ROOT END <<<<\n');
  const packageMetaKeys = Object.keys(packageMetaRecord);

  for (const packageMetaKey of packageMetaKeys) {
    try {
      verboseLog('>>>> PACKAGE START <<<<');
      const { path } = packageMetaRecord[packageMetaKey]!;
      const packageJson = loadPackageJson(path);
      const { name } = packageJson;
      verboseLog(`Versioning package: ${name}`);
      const { dir } = parse(path);
      const relativeDir = dir.replace(cwd, '');
      verboseLog(`Relative dir: ${relativeDir}`);

      if (!changedFiles.some(file => file.includes(relativeDir))) {
        verboseLog(`No files have changed since the last release tag: ${lastReleaseTag}`);

        if (!force) {
          verboseLog('>>>> PACKAGE END <<<<\n');
          return;
        }

        verboseLog('Force is set to true, proceeding regardless of file changes');
      }

      const packageChangedFiles = changedFiles.filter(file => file.includes(relativeDir));
      verboseLog(formatListLogMessage(`Package changed files`, packageChangedFiles));

      versionPackage(packageJson, {
        packageJsonPath: path,
        preReleaseId,
        tag,
        type,
      });

      const internalDepsPackageMeta = getInternalDepsPackageMeta(packageJson, packageMetaRecord);

      internalDepsPackageMeta.forEach(({ name }) => {
        if (!packageMetaKeys.includes(name)) {
          verboseLog(`${name} added to packages to version`);
          packageMetaKeys.push(name);
        }
      });

      verboseLog('>>>> PACKAGE END <<<<\n');
    } catch (err: unknown) {
      echo(`${chalk.magenta('Cutoff')} ${chalk.dim('=>')} ${chalk.red(`Error: ${(err as Error).message}`)}`);
      verboseLog('>>>> PACKAGE END <<<<\n');
    }
  }
};
