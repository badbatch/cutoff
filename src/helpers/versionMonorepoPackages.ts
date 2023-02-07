import { dim, magenta, red } from 'colorette';
import { parse, sep } from 'node:path';
import shelljs from 'shelljs';
import type { ReleaseMeta } from '../types.js';
import { formatListLogMessage } from './formatListLogMessage.js';
import { getChangedFiles } from './getChangedFiles.js';
import { getInternalDepsPackageMeta } from './getInternalDepsPackageMeta.js';
import { getLastReleaseTag } from './getLastReleaseTag.js';
import { getMonorepoPackageMeta } from './getMonorepoPackageMeta.js';
import { loadPackageJson } from './loadPackageJson.js';
import { verboseLog } from './verboseLog.js';
import { versionPackage } from './versionPackage.js';

export const versionMonorepoPackages = ({
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

  for (let index = packageMetaKeys.length - 1; index >= 0; index -= 1) {
    try {
      verboseLog('>>>> PACKAGE START <<<<');
      const packageMetaKey = packageMetaKeys[index]!;
      const packageMeta = packageMetaRecord[packageMetaKey]!;
      const packageJson = loadPackageJson(packageMeta.path);
      const { name } = packageJson;
      verboseLog(`Versioning package: ${name}`);
      const { dir } = parse(packageMeta.path);
      let relativeDirectory = dir.replace(cwd, '');

      if (relativeDirectory.startsWith(sep)) {
        relativeDirectory = relativeDirectory.slice(1);
      }

      verboseLog(`Relative dir: ${relativeDirectory}`);

      if (!changedFiles.some(file => file.includes(relativeDirectory))) {
        verboseLog(`No files have changed since the last release tag: ${lastReleaseTag}`);

        if (!force && !packageMeta.force) {
          verboseLog('>>>> PACKAGE END <<<<\n');
          continue;
        }

        if (force) {
          verboseLog('Force is set to true, proceeding regardless of file changes');
        } else if (packageMeta.force) {
          verboseLog('Package is an internal dependency of a package with file changes');
        }
      }

      const packageChangedFiles = changedFiles.filter(file => file.includes(relativeDirectory));

      if (packageChangedFiles.length > 0) {
        verboseLog(formatListLogMessage(`Package changed files`, packageChangedFiles));
      }

      versionPackage(packageJson, {
        packageJsonPath: packageMeta.path,
        preReleaseId,
        tag,
        type,
      });

      const internalDepsPackageMeta = getInternalDepsPackageMeta(packageJson, packageMetaRecord);

      for (const { name } of internalDepsPackageMeta) {
        const depsPackageMeta = packageMetaRecord[name];

        if (depsPackageMeta) {
          depsPackageMeta.force = true;
        }

        if (!packageMetaKeys.includes(name)) {
          verboseLog(`${name} added to packages to version`);
          packageMetaKeys.unshift(name);
          index += 1;
        }
      }

      verboseLog('>>>> PACKAGE END <<<<\n');
    } catch (error: unknown) {
      shelljs.echo(`${magenta('Cutoff')} ${dim('=>')} ${red(`Error: ${(error as Error).message}`)}`);
      verboseLog('>>>> PACKAGE END <<<<\n');
    } finally {
      packageMetaKeys.splice(index, 1);
    }
  }
};
