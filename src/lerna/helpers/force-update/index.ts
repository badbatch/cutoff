import { StringObject } from "@repodog/types";
import { readdirSync, statSync, writeFileSync } from "fs";
import { resolve } from "path";
import semver from "semver";
import { PackageConfig, UpdatedPackage } from "../../../types";

function updateDependencies(name: string, version: string, dependencies?: StringObject) {
  if (dependencies) {
    Object.keys(dependencies).forEach(key => {
      if (!key.startsWith(`@${name}/`)) return;
      if (semver.satisfies(version, dependencies[key])) return;
      dependencies[key] = `^${version}`;
    });
  }
}

export default function forceUpdate(name: string, version: string) {
  const cwd = process.cwd();
  const packagesPath = resolve(cwd, "packages");
  const filenames = readdirSync(packagesPath);
  const updated: UpdatedPackage[] = [];

  filenames.forEach(filename => {
    const packagePath = resolve(packagesPath, filename);
    if (!statSync(packagePath).isDirectory()) return;
    const configPath = resolve(packagePath, "package.json");
    const config: PackageConfig = require(configPath);
    updateDependencies(name, version, config.dependencies);
    updateDependencies(name, version, config.devDependencies);

    updated.push({
      name: config.name,
      private: config.private || false,
      version: config.version,
    });

    writeFileSync(configPath, JSON.stringify({ ...config, version }, null, 2));
  });

  writeFileSync(resolve(cwd, ".lerna.updated.json"), JSON.stringify(updated, null, 2));
}
