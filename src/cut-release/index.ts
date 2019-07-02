import { resolve } from "path";
import { ReleaseType } from "semver";
import shell from "shelljs";
import yargs from "yargs";
import addCommitPush from "../helpers/add-commit-push";
import checkoutMaster from "../helpers/checkout-master";
import getNewVersion from "../helpers/get-new-version";
import isValidReleaseTag from "../helpers/is-valid-release-tag";
import isValidReleaseType from "../helpers/is-valid-release-type";
import { PackageConfig, PreReleaseId, ReleaseTag } from "../types";

export default function cutRelease(): void {
  const argv = yargs
    .boolean("dryrun")
    .boolean("skip-checkout")
    .boolean("skip-posthook")
    .boolean("skip-prehook")
    .parse();

  const dryrun: boolean = argv.dryrun;
  const skipCheckout: boolean = argv.skipCheckout;
  const skipPosthook: boolean = argv.skipPosthook;
  const skipPrehook: boolean = argv.skipPrehook;
  const type: ReleaseType = argv.type;
  const tag: ReleaseTag | undefined = argv.tag;
  const preReleaseId: PreReleaseId | undefined = argv.preid;

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

  shell.exec(`yarn version --new-version ${newVersion} --no-git-tag-version`);

  if (dryrun) return;

  if (!skipPosthook && scripts["cutoff:post-version"]) {
    shell.exec("yarn run cutoff:post-version");
  }

  addCommitPush(newVersion);
}
