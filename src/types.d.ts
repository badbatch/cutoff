export interface StringObjectMap {
  [key: string]: string;
}

export interface PackageConfig {
  name: string;
  private?: boolean;
  scripts?: StringObjectMap;
  version: string;
}

export type ReleaseTypes = "major" | "minor" | "patch";

export interface UpdatedPackage {
  name: string;
  private: boolean;
  version: string;
}