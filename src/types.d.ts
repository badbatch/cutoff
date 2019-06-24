export interface ConfigMap {
  [key: string]: PackageConfig;
}

export interface LernaConfig {
  version: string;
}

export interface ObjectMap {
  [key: string]: any;
}

export type PreReleaseId = string;

export type ReleaseTag = "alpha" | "beta" | "unstable";

export interface PackageConfig {
  name: string;
  dependencies?: StringObjectMap;
  devDependencies?: StringObjectMap;
  private?: boolean;
  scripts?: StringObjectMap;
  version: string;
}

export interface StringObjectMap {
  [key: string]: string;
}

export interface UpdatedPackage {
  name: string;
  private: boolean;
  version: string;
}

export interface UpdatedPackagesMap {
  [key: string]: { private: boolean, version: string };
}
