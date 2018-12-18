import { ReleaseType } from "semver";

const RELEASE_TYPES = ["major", "premajor", "minor", "preminor", "patch", "prepatch", "prerelease"];

export default function isValidReleaseType(type: ReleaseType): boolean {
  return RELEASE_TYPES.includes(type);
}
