import glob from 'glob';
import type { PackageManager } from '../types.js';
import getPackagePatterns from './getPackagePatterns.js';

const { sync } = glob;

export default (packageManager: PackageManager) => {
  const packagePatterns = getPackagePatterns(packageManager);
  const includePatterns = packagePatterns.filter(pattern => !pattern.startsWith('!'));
  const excludePatterns = packagePatterns.filter(pattern => pattern.startsWith('!'));
  const includedFiles = sync(`+(${includePatterns.join('|')})`);
  const excludedFiles = sync(`+(${excludePatterns.join('|')})`);
  const files = includedFiles.filter(file => !excludedFiles.includes(file));
  return files.filter(file => file.endsWith('package.json'));
};
