import { resolve } from "path";
import shell from "shelljs";
import yargs from "yargs";
import { UpdatedPackage } from "../../types";

export default function publishLernaRelease() {
  const updatedConfigPath = resolve(process.cwd(), ".lerna.updated.json");
  const updated: UpdatedPackage[] = require(updatedConfigPath) || [];
  const names = updated.map(pkg => pkg.name);
  const concurrency: number = yargs.number("concurrency").parse().concurrency || 4;
  shell.exec(`lerna exec --concurrency ${concurrency} -- publish-lerna-cutoff-pkg --packages ${names.join(" ")}`);
}
