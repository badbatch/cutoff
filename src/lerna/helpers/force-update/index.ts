import { readdirSync, statSync, writeFileSync } from "fs";
import { resolve } from "path";
import { PackageConfig, UpdatedPackage } from "~/types";

export function forceUpdate(version: string): void {
  const packagesPath = resolve(process.cwd(), "packages");
  const filenames = readdirSync(packagesPath);
  const updated: UpdatedPackage[] = [];

  filenames.forEach((filename) => {
    const packagePath = resolve(packagesPath, filename);
    if (!statSync(packagePath).isDirectory()) return;
    const configPath = resolve(packagePath, "package.json");
    const config: PackageConfig = require(configPath);

    updated.push({
      name: config.name,
      private: config.private || false,
      version: config.version,
    });

    writeFileSync(configPath, JSON.stringify({ ...config, version }, null, 2));
  });

  writeFileSync(resolve(process.cwd(), ".lerna.updated.json"), JSON.stringify(updated, null, 2));
}
