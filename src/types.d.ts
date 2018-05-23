export interface ObjectMap {
  [key: string]: any;
}

export interface PackageConfig {
  name: string;
  dependencies?: StringObjectMap;
  devDependencies?: StringObjectMap;
  private?: boolean;
  scripts?: StringObjectMap;
  version: string;
}

export type ReleaseTypes = "major" | "minor" | "patch";

export interface StringObjectMap {
  [key: string]: string;
}

export interface UpdatedPackage {
  name: string;
  private: boolean;
  version: string;
}
