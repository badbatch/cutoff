import type { PackageJson } from 'type-fest';
import type { PackageMetaRecord } from '../types.js';
import { formatListLogMessage } from './formatListLogMessage.js';
import { verboseLog } from './verboseLog.js';

export const getInternalDepsPackageMeta = (
  { dependencies = {}, devDependencies = {}, peerDependencies = {} }: PackageJson,
  packageMetaRecord: PackageMetaRecord
) => {
  const packageNames = Object.keys(packageMetaRecord);
  const dependencyNames = Object.keys({ ...dependencies, ...devDependencies, ...peerDependencies });
  const internalDependencies = dependencyNames.filter(name => packageNames.includes(name));
  verboseLog(formatListLogMessage(`Internal dependencies`, internalDependencies));
  return internalDependencies.map(name => packageMetaRecord[name]!);
};
