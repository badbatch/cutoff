import * as semver from "semver";
import * as shell from "shelljs";
import { ReleaseTypes } from "../../types";

export function getNewVersion(version: string, type: ReleaseTypes): string | undefined {
  const newVersion = semver.inc(version, type);
  let invalid = false;

  if (!newVersion) {
    shell.echo(`The new package verison number is invalid.`);
  } else if (!semver.valid(newVersion)) {
    shell.echo(`The new package verison number (${newVersion}) is invalid.`);
    invalid = true;
  } else if (semver.lte(newVersion, version)) {
    shell.echo(`The new package verison number (${newVersion}) is not greater than the current version number.`);
    invalid = true;
  }

  if (!newVersion || invalid) {
    shell.exit(1);
    return;
  }

  return newVersion;
}
