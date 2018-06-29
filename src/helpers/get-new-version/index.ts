import * as semver from "semver";
import * as shell from "shelljs";
import { ReleaseTypes } from "../../types";

export default function getNewVersion(version: string, type: ReleaseTypes): string | undefined {
  const newVersion = semver.inc(version, type);

  if (!newVersion) {
    shell.echo(`The new package verison number is invalid.`);
    shell.exit(1);
    return;
  }

  return newVersion;
}
