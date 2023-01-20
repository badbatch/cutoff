import type { ReleaseType } from 'semver';

export const VALID_RELEASE_TYPES = ['major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'];

export const isValidReleaseType = (type: ReleaseType) => {
  return VALID_RELEASE_TYPES.includes(type);
};
