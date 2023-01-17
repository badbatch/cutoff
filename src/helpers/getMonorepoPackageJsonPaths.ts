import glob from 'glob';
import type { PackageManager } from '../types.js';
import formatListLogMessage from './formatListLogMessage.js';
import getPackagePatterns from './getPackagePatterns.js';
import verboseLog from './verboseLog.js';

const { sync } = glob;

export default (packageManager: PackageManager) => {
  const packagePatterns = getPackagePatterns(packageManager);
  verboseLog(formatListLogMessage('packagePatterns', packagePatterns));

  const includePatterns = packagePatterns.filter(pattern => !pattern.startsWith('!'));
  verboseLog(formatListLogMessage('includePatterns', includePatterns));

  const excludePatterns = packagePatterns.filter(pattern => pattern.startsWith('!'));
  verboseLog(formatListLogMessage('excludePatterns', excludePatterns));

  const includedPackages = includePatterns.reduce((acc, pattern) => {
    return new Set([...acc, ...sync(`${pattern}/package.json`)]);
  }, new Set<string>());

  verboseLog(formatListLogMessage('includedPackages', [...includedPackages]));

  const excludedPackages = excludePatterns.reduce((acc, pattern) => {
    return new Set([...acc, ...sync(`${pattern}/package.json`)]);
  }, new Set<string>());

  verboseLog(formatListLogMessage('excludedPackages', [...excludedPackages]));

  const packages = [...includedPackages].filter(file => !excludedPackages.has(file));
  verboseLog(formatListLogMessage('packages', packages));
  return packages;
};
