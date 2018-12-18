import { resolve } from "path";
import { ReleaseType } from "semver";
import shell from "shelljs";
import yargs from "yargs";
import addCommitPush from "../helpers/add-commit-push";
import checkoutMaster from "../helpers/checkout-master";
import getNewVersion from "../helpers/get-new-version";
import isValidReleaseType from "../helpers/is-valid-release-type";
import { PackageConfig, ReleaseTag } from "../types";

export default function cutRelease(): void {
  const argv = yargs.boolean("preview").parse();
  const dryrun: boolean = argv.dryrun;
  const type: ReleaseType = argv.type;
  const tag: ReleaseTag | undefined = argv.tag;

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
  shell.exec(`yarn run changelog --${type}`);

  if (scripts["cutoff:pre-version"]) {
    shell.exec("yarn run cutoff:pre-version");
  }

  shell.exec(`yarn version --new-version ${newVersion} --no-git-tag-version`);

  if (scripts["cutoff:post-version"]) {
    shell.exec("yarn run cutoff:post-version");
  }

  if (!dryrun) {
    addCommitPush(newVersion);
  }
}
