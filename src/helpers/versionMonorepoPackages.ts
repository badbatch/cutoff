import chalk from 'chalk';
import fs from 'fs-extra';
import { parse } from 'path';
import shell from 'shelljs';
import type { PackageJson, SetRequired } from 'type-fest';
import type { ReleaseMeta } from '../types.js';
import formatListLogMessage from './formatListLogMessage.js';
import getChangedFiles from './getChangedFiles.js';
import getLastReleaseTag from './getLastReleaseTag.js';
import getMonorepoPackageJsonPaths from './getMonorepoPackageJsonPaths.js';
import verboseLog from './verboseLog.js';
import versionPackage from './versionPackage.js';

const { readFileSync } = fs;
const { echo } = shell;

export default ({
  force,
  packageManager,
  preReleaseId,
  tag,
  type,
}: Pick<ReleaseMeta, 'force' | 'packageManager' | 'preReleaseId' | 'tag' | 'type'>) => {
  const packageJsonPaths = getMonorepoPackageJsonPaths(packageManager);
  const lastReleaseTag = getLastReleaseTag();
  const changedFiles = getChangedFiles(lastReleaseTag);
  const cwd = process.cwd();
  verboseLog(formatListLogMessage('Project changedFiles', changedFiles));
  verboseLog(`Project lastReleaseTag: ${lastReleaseTag}`);
  verboseLog('Versioning monorepo packages');
  verboseLog('>>>> PROJECT ROOT END <<<<\n');

  packageJsonPaths.forEach(packageJsonPath => {
    verboseLog('>>>> PACKAGE START <<<<');
    let packageJson: PackageJson;

    try {
      try {
        packageJson = JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf8' })) as PackageJson;
      } catch (err: unknown) {
        verboseLog(`packageJson read error: ${(err as Error).name}, ${(err as Error).message}`);
        throw new Error(`Could not resolve the package.json at: ${packageJsonPath}`);
      }

      const { name, version } = packageJson;

      if (!name) {
        throw new Error(`Expected the package.json at "${packageJsonPath}" to have a name`);
      }

      if (!version) {
        throw new Error(`Expected the package.json at "${packageJsonPath}" to have a version.`);
      }

      verboseLog(`Versioning package: ${name}`);
      verboseLog(`${name} packageJson imported with version ${version}`);
      const { dir } = parse(packageJsonPath);
      const relativeDir = dir.replace(cwd, '');
      verboseLog(`${name} relativeDir: ${relativeDir}`);

      if (!changedFiles.some(file => file.includes(relativeDir))) {
        verboseLog(`${name}: No files have changed since the last release tag ${lastReleaseTag}`);

        if (!force) {
          verboseLog('>>>> PACKAGE END <<<<\n');
          return;
        }

        verboseLog(`${name}: Force is set to true, proceeding regardless of file changes`);
      }

      const packageChangedFiles = changedFiles.filter(file => file.includes(relativeDir));
      verboseLog(formatListLogMessage(`${name} packageChangedFiles`, packageChangedFiles));

      versionPackage(packageJson as SetRequired<PackageJson, 'name' | 'version'>, {
        packageJsonPath,
        preReleaseId,
        tag,
        type,
      });

      verboseLog('>>>> PACKAGE END <<<<\n');
    } catch (err: unknown) {
      echo(`${chalk.magenta('Cutoff')} ${chalk.dim('=>')} ${chalk.red(`Error: ${(err as Error).message}`)}`);
      verboseLog('>>>> PACKAGE END <<<<\n');
    }
  });
};
