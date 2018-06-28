import { readdirSync, statSync, writeFileSync } from "fs";
import { resolve } from "path";
import { PackageConfig, StringObjectMap, UpdatedPackage } from "../../../types";

function updateDependencies(updatedNames: string[], version: string, dependencies?: StringObjectMap): void {
  if (dependencies) {
    Object.keys(dependencies).forEach((key) => {
      if (updatedNames.includes(key)) dependencies[key] = version;
    });
  }
}

export function updatePackages(version: string): void {
  const cwd = process.cwd();
  const updatedConfigPath = resolve(cwd, ".lerna.updated.json");
  const updatedConfig: UpdatedPackage[] = require(updatedConfigPath);
  const updatedNames: string[] = updatedConfig.map((pkg) => pkg.name);
  const packagesPath = resolve(cwd, "packages");
  const filenames = readdirSync(packagesPath);

  filenames.forEach((filename) => {
    const packagePath = resolve(packagesPath, filename);
    if (!statSync(packagePath).isDirectory()) return;
    const configPath = resolve(packagePath, "package.json");
    const config: PackageConfig = require(configPath);

    if (updatedNames.includes(config.name)) {
      config.version = version;
    }

    updateDependencies(updatedNames, version, config.dependencies);
    updateDependencies(updatedNames, version, config.devDependencies);
    writeFileSync(configPath, JSON.stringify({ ...config, version }, null, 2));
  });
}
