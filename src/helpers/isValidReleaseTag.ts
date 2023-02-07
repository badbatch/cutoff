import type { ReleaseTag } from '../types.js';

export const VALID_RELEASE_TAGS = ['alpha', 'beta', 'unstable'];

export const isValidReleaseTag = (tag: string): tag is ReleaseTag => {
  return VALID_RELEASE_TAGS.includes(tag);
};
