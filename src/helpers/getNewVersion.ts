import semver, { type ReleaseType } from 'semver';
import type { PreReleaseId, ReleaseTag } from '../types.js';

export const getNewVersion = (version: string, type: ReleaseType, tag?: ReleaseTag, preReleaseId?: PreReleaseId) => {
  if (tag && preReleaseId) {
    tag += `.${preReleaseId}`;
  }

  return semver.inc(version, type, false, tag);
};
