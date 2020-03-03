import { StringObject } from "@repodog/types";

export interface ConfigMap {
  [key: string]: PackageConfig;
}

export interface LernaConfig {
  version: string;
}

export type PreReleaseId = string;

export type ReleaseTag = "alpha" | "beta" | "unstable";

export interface PackageConfig {
  dependencies?: StringObject;
  devDependencies?: StringObject;
  name: string;
  private?: boolean;
  scripts?: StringObject;
  version: string;
}

export interface UpdatedPackage {
  name: string;
  private: boolean;
  version: string;
}

export interface UpdatedPackagesMap {
  [key: string]: { private: boolean; version: string };
}
