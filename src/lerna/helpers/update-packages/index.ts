import { readdirSync, statSync, writeFileSync } from "fs";
import { resolve } from "path";
import semver from "semver";
import { PackageConfig, StringObjectMap, UpdatedPackage } from "../../../types";

function updateDependencies(updatedNames: string[], version: string, dependencies?: StringObjectMap): boolean {
  let updated = false;

  if (dependencies) {
    Object.keys(dependencies).forEach((key) => {
      if (!updatedNames.includes(key) || semver.satisfies(version, dependencies[key])) return;
      dependencies[key] = `~${version}`;
      updated = true;
    });
  }

  return updated;
}

export default function updatePackages(version: string): void {
  const cwd = process.cwd();
  const updatedConfigPath = resolve(cwd, ".lerna.updated.json");
  const updatedConfig: UpdatedPackage[] = require(updatedConfigPath) || [];
  const updatedNames: string[] = updatedConfig.map((pkg) => pkg.name);
  const packagesPath = resolve(cwd, "packages");
  const filenames = readdirSync(packagesPath);

  filenames.forEach((filename) => {
    const packagePath = resolve(packagesPath, filename);
    if (!statSync(packagePath).isDirectory()) return;
    const configPath = resolve(packagePath, "package.json");
    const config: PackageConfig = require(configPath);
    let packageUpdated = false;

    if (updatedNames.includes(config.name)) {
      config.version = version;
      packageUpdated = true;
    }

    const dependenciesUpdated = updateDependencies(updatedNames, version, config.dependencies);
    const devDependenciesUpdated = updateDependencies(updatedNames, version, config.devDependencies);
    if (!packageUpdated && !dependenciesUpdated && !devDependenciesUpdated) return;
    writeFileSync(configPath, JSON.stringify(config, null, 2));
  });
}