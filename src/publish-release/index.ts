import { resolve } from "path";
import shell from "shelljs";
import getTag from "../helpers/get-tag";
import { PackageConfig } from "../types";

export default function publishRelease() {
  const packagePath = resolve(process.cwd(), "package.json");
  const { version }: PackageConfig = require(packagePath);
  const tag = getTag(version);
  shell.exec(`yarn publish --new-version ${version}${tag ? ` --tag ${tag}` : ""}`);
}
