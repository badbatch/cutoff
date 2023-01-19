import glob from 'glob';
import type { PackageManager, PackageMetaRecord } from '../types.js';
import formatListLogMessage from './formatListLogMessage.js';
import getPackagePatterns from './getPackagePatterns.js';
import loadPackageJson from './loadPackageJson.js';
import verboseLog from './verboseLog.js';

const { sync } = glob;

export default (packageManager: PackageManager) => {
  const packagePatterns = getPackagePatterns(packageManager);
  verboseLog(formatListLogMessage('Package patterns', packagePatterns));

  const includePatterns = packagePatterns.filter(pattern => !pattern.startsWith('!'));
  verboseLog(formatListLogMessage('Include patterns', includePatterns));

  const excludePatterns = packagePatterns.filter(pattern => pattern.startsWith('!'));
  verboseLog(formatListLogMessage('Exclude patterns', excludePatterns));

  const includedPackagePaths = includePatterns.reduce((acc, pattern) => {
    return new Set([...acc, ...sync(`${pattern}/package.json`)]);
  }, new Set<string>());

  verboseLog(formatListLogMessage('Included package paths', [...includedPackagePaths]));

  const excludedPackagePaths = excludePatterns.reduce((acc, pattern) => {
    return new Set([...acc, ...sync(`${pattern}/package.json`)]);
  }, new Set<string>());

  verboseLog(formatListLogMessage('Excluded package paths', [...excludedPackagePaths]));

  const packagePaths = [...includedPackagePaths].filter(file => !excludedPackagePaths.has(file));
  verboseLog(formatListLogMessage('Package paths', packagePaths));

  return packagePaths.reduce((acc: PackageMetaRecord, packagePath) => {
    const { name } = loadPackageJson(packagePath);

    acc[name] = {
      name,
      path: packagePath,
    };

    return acc;
  }, {});
};
