import type { ReleaseType } from 'semver';
import semver from 'semver';
import type { PreReleaseId, ReleaseTag } from '../types.js';

const { inc } = semver;

export const getNewVersion = (version: string, type: ReleaseType, tag?: ReleaseTag, preReleaseId?: PreReleaseId) => {
  if (tag && preReleaseId) {
    tag += `.${preReleaseId}`;
  }

  return inc(version, type, false, tag);
};
