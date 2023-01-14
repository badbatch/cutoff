import { parse } from 'path';
import type { ReleaseMeta } from '../types.js';
import getChangedFiles from './getChangedFiles.js';
import getLastReleaseTag from './getLastReleaseTag.js';
import getMonorepoPackageJsonPaths from './getMonorepoPackageJsonPaths.js';
import versionPackage from './versionPackage.js';

export default (
  {
    force,
    packageManager,
    preReleaseId,
    tag,
    type,
  }: Pick<ReleaseMeta, 'force' | 'packageManager' | 'preReleaseId' | 'tag' | 'type'>,
  verboseLog: (msg: string) => void
) => {
  const packageJsonPaths = getMonorepoPackageJsonPaths(packageManager);
  const lastReleaseTag = getLastReleaseTag();
  const changedFiles = getChangedFiles(lastReleaseTag);
  const cwd = process.cwd();
  verboseLog('Versioning monorepo packages');
  verboseLog(`packageJsonPaths: ${packageJsonPaths.join('\n')}`);
  verboseLog(`changedFiles: ${changedFiles.join('\n')}`);
  verboseLog(`lastReleaseTag: ${lastReleaseTag}`);

  packageJsonPaths.forEach(packageJsonPath => {
    const { dir } = parse(packageJsonPath);
    const relativeDir = dir.replace(cwd, '');
    verboseLog(`relativeDir: ${relativeDir}`);

    if (!force && !changedFiles.some(file => file.includes(relativeDir))) {
      verboseLog(`Cutoff => No files have changed in "${relativeDir}" since the last release tag: ${lastReleaseTag}`);
      return;
    }

    versionPackage(packageJsonPath, { preReleaseId, tag, type }, verboseLog);
  });
};
