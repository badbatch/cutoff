import glob from 'glob';
import type { PackageManager } from '../types.js';
import { formatListLogMessage } from './formatListLogMessage.js';
import { getPackagePatterns } from './getPackagePatterns.js';
import { verboseLog } from './verboseLog.js';

export const getMonorepoPackageJsonPaths = (packageManager: PackageManager) => {
  const packagePatterns = getPackagePatterns(packageManager);
  verboseLog(formatListLogMessage('packagePatterns', packagePatterns));

  const includePatterns = packagePatterns.filter(pattern => !pattern.startsWith('!'));
  verboseLog(formatListLogMessage('includePatterns', includePatterns));

  const excludePatterns = packagePatterns.filter(pattern => pattern.startsWith('!'));
  verboseLog(formatListLogMessage('excludePatterns', excludePatterns));

  let includedPackages = new Set<string>();

  for (const pattern of includePatterns) {
    includedPackages = new Set([...includedPackages, ...glob.sync(`${pattern}/package.json`)]);
  }

  verboseLog(formatListLogMessage('includedPackages', [...includedPackages]));

  let excludedPackages = new Set<string>();

  for (const pattern of excludePatterns) {
    excludedPackages = new Set([...excludedPackages, ...glob.sync(`${pattern}/package.json`)]);
  }

  verboseLog(formatListLogMessage('excludedPackages', [...excludedPackages]));

  const packages = [...includedPackages].filter(file => !excludedPackages.has(file));
  verboseLog(formatListLogMessage('packages', packages));
  return packages;
};
