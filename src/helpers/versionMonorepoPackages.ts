import { parse } from 'path';
import shelljs from 'shelljs';
import type { ReleaseMeta } from '../types.js';
import getChangedFiles from './getChangedFiles.js';
import getLastReleaseTag from './getLastReleaseTag.js';
import getMonorepoPackageJsonPaths from './getMonorepoPackageJsonPaths.js';
import versionPackage from './versionPackage.js';

const { echo } = shelljs;

export default async ({
  packageManager,
  preReleaseId,
  tag,
  type,
}: Pick<ReleaseMeta, 'packageManager' | 'preReleaseId' | 'tag' | 'type'>) => {
  const packageJsonPaths = await getMonorepoPackageJsonPaths(packageManager);
  const lastReleaseTag = getLastReleaseTag();
  const changedFiles = getChangedFiles(lastReleaseTag);
  const cwd = process.cwd();

  packageJsonPaths.forEach(packageJsonPath => {
    const { dir } = parse(packageJsonPath);
    const relativeDir = dir.replace(cwd, '');

    if (!changedFiles.some(file => file.includes(relativeDir))) {
      echo(`Cutoff => No files have changed in "${relativeDir}" since the last release tag: ${lastReleaseTag}`);
      return;
    }

    void versionPackage(packageJsonPath, { preReleaseId, tag, type });
  });
};
