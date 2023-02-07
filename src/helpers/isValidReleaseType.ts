import type { ReleaseType } from 'semver';

export const VALID_RELEASE_TYPES = ['major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'];

export const isValidReleaseType = (type: string): type is ReleaseType => {
  return VALID_RELEASE_TYPES.includes(type);
};
