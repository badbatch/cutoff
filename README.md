# Cutoff

A command line utility for cutting releases and publishing to npm.

[![Build Status](https://travis-ci.com/badbatch/cutoff.svg?branch=master)](https://travis-ci.com/badbatch/cutoff)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![npm version](https://badge.fury.io/js/cutoff.svg)](https://badge.fury.io/js/cutoff)

## Summary

* Works with npm, yarn and pnpm.
* Works with standard repo and monorepo structures.
* Cuts major, minor, patch and pre- release types from any branch.
* Generates changelog based on conventional commits since last git tag.
* Updates package version and git tag automatically based on release type.
* Exposes pre- and post-versioning npm script hooks to run custom tasks.
* Commits changelog, version and custom task changes to remote prior to cutting tag.
* Provides separate cli command to publish new version to configured package registry.
* Allows force updates of packages to next version regardless of files changed.

## Installation

```sh
# terminal
npm install cutoff --save-dev
```

## Configuration

```json
// package.json
"scripts": {
  "cutoff:cut": "cutoff cut",
  "cutoff:publish": "cutoff publish"
}
```

## Usage

### cut

```sh
cutoff cut <type>

Cut release to current branch

Positionals:
  type  The release type: major | premajor | minor | preminor | patch | prepatch
        | prerelease                                         [string] [required]

Options:
  --version        Show version number                                 [boolean]
  --help           Show help                                           [boolean]
  --tag            The release tag: alpha | beta | unstable             [string]
  --dry-run        The release tag: alpha | beta | unstable            [boolean]
  --preid          The pre release ID                                   [string]
  --skip-posthook  To skip post version lifecycle hook                 [boolean]
  --skip-prehook   To skip pre version lifecycle hook                  [boolean]
```

### publish

```sh
cutoff publish

Publish packages to registry

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

## Script hooks

### cutoff:pre-version

Any tasks you want to run prior to package versions getting updated should be run in this script hook.

```json
// package.json
"scripts": {
  "cutoff:pre-version": "npm run pre-version-tasks"
}
```

### cutoff:post-version

Any tasks you want to run after package versions have been updated should be run in this script hook.

```json
// package.json
"scripts": {
  "cutoff:post-version": "npm run post-version-tasks"
}
```

## Changelog

Check out the [features, fixes and more](CHANGELOG.md) that go into each major, minor and patch version.

## License

Cutoff is [MIT Licensed](LICENSE).
