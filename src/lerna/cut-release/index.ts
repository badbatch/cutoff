import { writeFileSync } from "fs";
import { resolve } from "path";
import * as shell from "shelljs";
import * as yargs from "yargs";
import { addCommitPush } from "../../helpers/add-commit-push";
import { checkoutMaster } from "../../helpers/checkout-master";
import { getNewVersion } from "../../helpers/get-new-version";
import { forceUpdate } from "../../lerna/helpers/force-update";
import { LernaConfig, PackageConfig, ReleaseTypes } from "../../types";
import { updatePackages } from "../helpers/update-packages";

export function cutLernaRelease(): void {
  const argv = yargs
    .boolean("force")
    .boolean("preview")
    .parse();

  const force: boolean = argv.force;
  const preview: boolean = argv.preview;
  const type: ReleaseTypes = argv.type;

  if (type !== "major" && type !== "minor" && type !== "patch") {
    shell.echo('cutoff expected type to be "major", "minor" or "patch".');
    shell.exit(1);
    return;
  }

  const configPath = resolve(process.cwd(), "package.json");
  const config: PackageConfig = require(configPath);
  const { scripts = {}, version } = config;
  const newVersion = getNewVersion(version, type);
  if (!newVersion) return;

  checkoutMaster();
  shell.exec(`yarn run changelog --${type}`);

  if (scripts["cutoff:pre-version"]) {
    shell.exec("yarn run cutoff:pre-version");
  }

  if (force) {
    forceUpdate(config.name, newVersion);
  } else {
    shell.exec("lerna updated --json > .lerna.updated.json");
    const lernaConfigPath = resolve(process.cwd(), "lerna.json");
    const lernaConfig: LernaConfig = require(lernaConfigPath);
    writeFileSync(lernaConfigPath, JSON.stringify({ ...lernaConfig, version }, null, 2));
    updatePackages(version);
  }

  shell.exec(`yarn version --new-version ${newVersion} --no-git-tag-version`);

  if (scripts["cutoff:post-version"]) {
    shell.exec("yarn run cutoff:post-version");
  }

  if (!preview) {
    addCommitPush(newVersion);
  }
}
