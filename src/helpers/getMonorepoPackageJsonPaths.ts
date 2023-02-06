import glob from 'glob';
import type { PackageManager } from '../types.js';
import { formatListLogMessage } from './formatListLogMessage.js';
import { getPackagePatterns } from './getPackagePatterns.js';
import { verboseLog } from './verboseLog.js';

export const getMonorepoPackageJsonPaths = (packageManager: PackageManager) => {
  const packagePatterns = getPackagePatterns(packageManager);
  verboseLog(formatListLogMessage('Package patterns', packagePatterns));

  const includePatterns = packagePatterns.filter(pattern => !pattern.startsWith('!'));
  verboseLog(formatListLogMessage('Include patterns', includePatterns));

  const excludePatterns = packagePatterns.filter(pattern => pattern.startsWith('!')).map(pattern => pattern.slice(1));
  verboseLog(formatListLogMessage('Exclude patterns', excludePatterns));

  let includedPackagePaths = new Set<string>();

  for (const pattern of includePatterns) {
    includedPackagePaths = new Set([...includedPackagePaths, ...glob.sync(`${pattern}/package.json`)]);
  }

  verboseLog(formatListLogMessage('Included package paths', [...includedPackagePaths]));

  let excludedPackagePaths = new Set<string>();

  for (const pattern of excludePatterns) {
    excludedPackagePaths = new Set([...excludedPackagePaths, ...glob.sync(`${pattern}/package.json`)]);
  }

  verboseLog(formatListLogMessage('Excluded package paths', [...excludedPackagePaths]));

  const packagePaths = [...includedPackagePaths].filter(file => !excludedPackagePaths.has(file));
  verboseLog(formatListLogMessage('Package paths', packagePaths));
  return packagePaths;
};
