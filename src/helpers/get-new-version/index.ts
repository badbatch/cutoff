import semver, { ReleaseType } from "semver";
import shell from "shelljs";
import { PreReleaseId, ReleaseTag } from "../../types";

export default function getNewVersion(
  version: string,
  type: ReleaseType,
  tag?: ReleaseTag,
  preReleaseId?: PreReleaseId,
) {
  if (tag && preReleaseId) {
    tag += preReleaseId;
  }

  const newVersion = semver.inc(version, type, false, tag);

  if (!newVersion) {
    shell.echo(`The new package verison number is invalid.`);
    shell.exit(1);
    return;
  }

  return newVersion;
}
