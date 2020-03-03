import { ReleaseType } from "semver";

const RELEASE_TYPES = ["major", "premajor", "minor", "preminor", "patch", "prepatch", "prerelease"];

export default function isValidReleaseType(type: ReleaseType) {
  return RELEASE_TYPES.includes(type);
}
