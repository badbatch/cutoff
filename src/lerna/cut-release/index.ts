import { writeFileSync } from "fs";
import { resolve } from "path";
import semver, { ReleaseType } from "semver";
import shell from "shelljs";
import yargs from "yargs";
import addCommitPush from "../../helpers/add-commit-push";
import checkoutMaster from "../../helpers/checkout-master";
import getNewVersion from "../../helpers/get-new-version";
import isValidReleaseType from "../../helpers/is-valid-release-type";
import forceUpdate from "../../lerna/helpers/force-update";
import { LernaConfig, PackageConfig, ReleaseTag } from "../../types";
import updatePackages from "../helpers/update-packages";

export default function cutLernaRelease(): void {
  const argv = yargs
    .boolean("force")
    .boolean("dryrun")
    .parse();

  const dryrun: boolean = argv.dryrun;
  const force: boolean = argv.force;
  const tag: ReleaseTag | undefined = argv.tag;
  const type: ReleaseType = argv.type;

  if (!isValidReleaseType(type)) {
    shell.echo("cutoff expected type to be a valid release type.");
    shell.exit(1);
    return;
  }

  const configPath = resolve(process.cwd(), "package.json");
  const config: PackageConfig = require(configPath);
  const { scripts = {}, version } = config;
  const newVersion = getNewVersion(version, type, tag);
  if (!newVersion) return;

  checkoutMaster();

  if (["patch", "minor", "major"].includes(type)) {
    shell.exec(`yarn run changelog --${type}`);
  }

  if (scripts["cutoff:pre-version"]) {
    shell.exec("yarn run cutoff:pre-version");
  }

  if (force) {
    forceUpdate(config.name, newVersion);
  } else {
    shell.exec("lerna updated --json > .lerna.updated.json");
    updatePackages(type, tag);
  }

  if (semver.gt(newVersion, version)) {
    const lernaConfigPath = resolve(process.cwd(), "lerna.json");
    const lernaConfig: LernaConfig = require(lernaConfigPath);
    writeFileSync(lernaConfigPath, JSON.stringify({ ...lernaConfig, version: newVersion }, null, 2));
    shell.exec(`yarn version --new-version ${newVersion} --no-git-tag-version`);
  }

  if (dryrun) return;

  if (scripts["cutoff:post-version"]) {
    shell.exec("yarn run cutoff:post-version");
  }

  addCommitPush(newVersion);
}
