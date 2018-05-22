import { resolve } from "path";
import * as shell from "shelljs";
import { UpdatedPackage } from "~/types";

export function publishLernaRelease() {
  const updatedConfigPath = resolve(process.cwd(), ".lerna.updated.json");
  const updated: UpdatedPackage[] = require(updatedConfigPath);
  const names = updated.map((pkg) => pkg.name);
  shell.exec(`lerna exec --parallel -- publish-lerna-cutoff-pkg --packages ${names.join(" ")}`);
}
