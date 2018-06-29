import { resolve } from "path";
import * as shell from "shelljs";
import { PackageConfig } from "../types";

export default function publishRelease(): void {
  const packagePath = resolve(process.cwd(), "package.json");
  const { version }: PackageConfig = require(packagePath);
  shell.exec(`yarn publish --new-version ${version}`);
}
