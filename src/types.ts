import type { ReleaseType } from 'semver';

export interface CutReleaseArgs {
  'dry-run'?: boolean;
  preid?: string;
  'skip-posthook'?: boolean;
  'skip-prehook'?: boolean;
  tag?: string;
  type?: string;
  verbose?: boolean;
}

export type PackageManager = 'npm' | 'yarn' | 'pnpm';

export interface PnpmWorkspaceYaml {
  packages: string[];
}

export type PreReleaseId = string;

export interface ReleaseMeta {
  dryrun: boolean;
  packageManager: PackageManager;
  preReleaseId?: PreReleaseId;
  skipPosthook: boolean;
  skipPrehook: boolean;
  tag?: ReleaseTag;
  type: ReleaseType;
}

export type ReleaseTag = 'alpha' | 'beta' | 'unstable';
