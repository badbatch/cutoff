import { StringObject } from "@repodog/types";
import { readdirSync, statSync, writeFileSync } from "fs";
import { resolve } from "path";
import semver, { ReleaseType } from "semver";
import getNewVersion from "../../../helpers/get-new-version";
import { ConfigMap, PackageConfig, PreReleaseId, ReleaseTag, UpdatedPackage } from "../../../types";

function updateDependencies(updatedNames: string[], configMap: ConfigMap, dependencies?: StringObject) {
  let updated = false;

  if (dependencies) {
    Object.keys(dependencies).forEach(key => {
      if (!updatedNames.includes(key)) return;

      const newVersion = configMap[key] && configMap[key].version;
      if (!newVersion || semver.satisfies(newVersion, dependencies[key])) return;

      dependencies[key] = `^${newVersion}`;
      updated = true;
    });
  }

  return updated;
}

export default function updatePackages(type: ReleaseType, tag?: ReleaseTag, preReleaseId?: PreReleaseId) {
  const cwd = process.cwd();
  const updatedConfigPath = resolve(cwd, ".lerna.updated.json");
  const updatedConfig: UpdatedPackage[] = require(updatedConfigPath) || [];
  const updatedNames: string[] = updatedConfig.map(pkg => pkg.name);
  const packagesPath = resolve(cwd, "packages");
  const filenames = readdirSync(packagesPath);
  const configMap: ConfigMap = {};

  filenames.forEach(filename => {
    const packagePath = resolve(packagesPath, filename);
    if (!statSync(packagePath).isDirectory()) return;
    const configPath = resolve(packagePath, "package.json");
    const config: PackageConfig = require(configPath);
    let packageUpdated = false;

    if (updatedNames.includes(config.name)) {
      const newVersion = getNewVersion(config.version, type, tag, preReleaseId);

      if (newVersion) {
        config.version = newVersion;
        packageUpdated = true;
      }
    }

    if (!packageUpdated) return;
    configMap[config.name] = config;
  });

  filenames.forEach(filename => {
    const packagePath = resolve(packagesPath, filename);
    if (!statSync(packagePath).isDirectory()) return;
    const configPath = resolve(packagePath, "package.json");
    const config: PackageConfig = require(configPath);
    const dependenciesUpdated = updateDependencies(updatedNames, configMap, config.dependencies);
    const devDependenciesUpdated = updateDependencies(updatedNames, configMap, config.devDependencies);
    const packageUpdated = !!configMap[config.name];
    if (!packageUpdated && !dependenciesUpdated && !devDependenciesUpdated) return;
    writeFileSync(configPath, JSON.stringify(config, null, 2));
  });
}
