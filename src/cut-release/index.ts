import * as dotenv from "dotenv";
import { resolve } from "path";
import * as shell from "shelljs";
import * as yargs from "yargs";
import { PackageConfig, ReleaseTypes } from "~/types";
import { addCommitPush } from "~/helpers/add-commit-push";
import { checkoutMaster } from "~/helpers/checkout-master";
import { getNewVersion } from "~/helpers/get-new-version";

export function cutRelease() {
  dotenv.config();
  const { argv } = yargs.boolean("preview");
  const type: ReleaseTypes = argv.type;
  const preview: boolean = argv.preview;

  if (type !== "major" && type !== "minor" && type !== "patch") {
    shell.echo('cutoff expected type to be "major", "minor" or "patch".');
    shell.exit(1);
  }

  const configPath = resolve(process.cwd(), "package.json");
  const config: PackageConfig = require(configPath);
  const { scripts = {}, version } = config;
  const newVersion = getNewVersion(version, type);

  checkoutMaster();
  shell.exec(`yarn run changelog --${type}`);

  if (scripts["cutoff:pre-version"]) {
    shell.exec("yarn run cutoff:pre-version");
  }

  shell.exec(`yarn version --new-version ${newVersion} --no-git-tag-version`);

  if (scripts["cutoff:post-version"]) {
    shell.exec("yarn run cutoff:post-version");
  }

  if (!preview) {
    addCommitPush(newVersion);
  }
}
