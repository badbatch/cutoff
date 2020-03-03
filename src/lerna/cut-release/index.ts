import { writeFileSync } from "fs";
import { resolve } from "path";
import semver, { ReleaseType } from "semver";
import shell from "shelljs";
import yargs from "yargs";
import addCommitPush from "../../helpers/add-commit-push";
import checkoutMaster from "../../helpers/checkout-master";
import getNewVersion from "../../helpers/get-new-version";
import isValidReleaseTag from "../../helpers/is-valid-release-tag";
import isValidReleaseType from "../../helpers/is-valid-release-type";
import forceUpdate from "../../lerna/helpers/force-update";
import { LernaConfig, PackageConfig, PreReleaseId, ReleaseTag } from "../../types";
import updatePackages from "../helpers/update-packages";

export default function cutLernaRelease() {
  const argv = yargs
    .boolean("force")
    .boolean("dryrun")
    .boolean("skip-checkout")
    .boolean("skip-posthook")
    .boolean("skip-prehook")
    .parse();

  const dryrun: boolean = argv.dryrun || false;
  const force: boolean = argv.force || false;
  const skipCheckout: boolean = argv["skip-checkout"] || false;
  const skipPosthook: boolean = argv["skip-posthook"] || false;
  const skipPrehook: boolean = argv["skip-prehook"] || false;
  const type = argv.type as ReleaseType;
  const tag = argv.tag as ReleaseTag | undefined;
  const preReleaseId = argv.preid as PreReleaseId | undefined;

  if (!isValidReleaseType(type)) {
    shell.echo("cutoff expected type to be a valid release type.");
    shell.exit(1);
    return;
  }

  if (tag && !isValidReleaseTag(tag)) {
    shell.echo("cutoff expected tag to be a valid release tag.");
    shell.exit(1);
    return;
  }

  const configPath = resolve(process.cwd(), "package.json");
  const config: PackageConfig = require(configPath);
  const { scripts = {}, version } = config;
  const newVersion = getNewVersion(version, type, tag, preReleaseId);
  if (!newVersion) return;

  if (!skipCheckout) {
    checkoutMaster();
  }

  if (["patch", "minor", "major"].includes(type)) {
    shell.exec(`yarn run changelog --${type}`);
  }

  if (!skipPrehook && scripts["cutoff:pre-version"]) {
    shell.exec("yarn run cutoff:pre-version");
  }

  if (type === "major" || force) {
    forceUpdate(config.name, newVersion);
  } else {
    shell.exec("lerna updated --json > .lerna.updated.json");
    updatePackages(type, tag, preReleaseId);
  }

  if (semver.gt(newVersion, version)) {
    const lernaConfigPath = resolve(process.cwd(), "lerna.json");
    const lernaConfig: LernaConfig = require(lernaConfigPath);
    writeFileSync(lernaConfigPath, JSON.stringify({ ...lernaConfig, version: newVersion }, null, 2));
    shell.exec(`yarn version --new-version ${newVersion} --no-git-tag-version`);
  }

  if (dryrun) return;

  if (!skipPosthook && scripts["cutoff:post-version"]) {
    shell.exec("yarn run cutoff:post-version");
  }

  addCommitPush(newVersion);
}
