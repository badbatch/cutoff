import glob from 'glob';
import type { PackageManager, PackageMetaRecord } from '../types.js';
import { formatListLogMessage } from './formatListLogMessage.js';
import { getPackagePatterns } from './getPackagePatterns.js';
import { loadPackageJson } from './loadPackageJson.js';
import { verboseLog } from './verboseLog.js';

const { sync } = glob;

export const getMonorepoPackageMeta = (packageManager: PackageManager) => {
  const packagePatterns = getPackagePatterns(packageManager);
  verboseLog(formatListLogMessage('Package patterns', packagePatterns));

  const includePatterns = packagePatterns.filter(pattern => !pattern.startsWith('!'));
  verboseLog(formatListLogMessage('Include patterns', includePatterns));

  const excludePatterns = packagePatterns.filter(pattern => pattern.startsWith('!'));
  verboseLog(formatListLogMessage('Exclude patterns', excludePatterns));

  let includedPackagePaths = new Set<string>();

  for (const pattern of includePatterns) {
    includedPackagePaths = new Set([...includedPackagePaths, ...sync(`${pattern}/package.json`)]);
  }

  verboseLog(formatListLogMessage('Included package paths', [...includedPackagePaths]));

  let excludedPackagePaths = new Set<string>();

  for (const pattern of excludePatterns) {
    excludedPackagePaths = new Set([...excludedPackagePaths, ...sync(`${pattern}/package.json`)]);
  }

  verboseLog(formatListLogMessage('Excluded package paths', [...excludedPackagePaths]));

  const packagePaths = [...includedPackagePaths].filter(file => !excludedPackagePaths.has(file));
  verboseLog(formatListLogMessage('Package paths', packagePaths));

  const packageMetaRecord: PackageMetaRecord = {};

  for (const packagePath of packagePaths) {
    const { name } = loadPackageJson(packagePath);

    packageMetaRecord[name] = {
      name,
      path: packagePath,
    };
  }

  return packageMetaRecord;
};
