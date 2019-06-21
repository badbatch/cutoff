# Cutoff

An opinionated command line utility for cutting releases and publishing to npm.

[![Build Status](https://travis-ci.org/bad-batch/cutoff.svg?branch=master)](https://travis-ci.org/bad-batch/cutoff)
[![codecov](https://codecov.io/gh/bad-batch/cutoff/branch/master/graph/badge.svg)](https://codecov.io/gh/bad-batch/cutoff)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![npm version](https://badge.fury.io/js/cutoff.svg)](https://badge.fury.io/js/cutoff)
[![dependencies Status](https://david-dm.org/bad-batch/cutoff/status.svg)](https://david-dm.org/bad-batch/cutoff)
[![devDependencies Status](https://david-dm.org/bad-batch/cutoff/dev-status.svg)](https://david-dm.org/bad-batch/cutoff?type=dev)

## Summary

* Works exclusively with Yarn... sorry npm, it is just better.
* Cuts major, minor or patch releases from master branch.
* Generates changelog based on angular-style commits since last git tag.
* Updates package version and git tag automatically based on release type.
* Exposes pre- and post-versioning npm script hooks to run custom tasks.
* Commits changelog, version and custom task changes to master prior to cutting tag.
* Provides separate cli command to publish new version to npm.
* Offers all of the above for fixed-mode Lerna-based monorepos.
* Allows force updates of all monorepo packages to next version.

## Installation

```bash
yarn add cutoff --dev
```

## Commands

### cutoff

The script cuts a major, minor or patch release, generates/updates the changelog, runs the pre-versioning
npm script hook, updates the project version, runs the post-versioning npm script hook, commits the changes to master
with the message `"Release version <version>."`, and then commits a new tag with the same message.

Include the `--dryrun` flag to stop the script after the versioning is completed, so no changes are
committed to master. Include the `--skip-checkout` flag to commit the changes to current branch.

```json
"scripts": {
  "cutoff": "cutoff"
}
```

```bash
yarn run cutoff
  [--type <major | premajor | minor | preminor | patch | prepatch | prerelease>]
  [--tag <alpha | beta | unstable> [--preid <string>]]
  [--skip-checkout]
  [--dryrun]
```

### cutoff-lerna

The script cuts a major, minor or patch release, generates/updates the changelog, runs the pre-versioning npm script
hook, updates the project, lerna config and package versions, writes the list of updated packages to
`.lerna.updated.json`, runs the post-versioning npm script hook, commits the changes to master with the message
`"Release version <version>."`, and then commits a new tag with the same message.

Include the `--dryrun` flag to stop the script after the versioning is completed, so no changes are
committed to master. Include the `--force` flag to force update all packages to the new version. Include the
`--skip-checkout` flag to commit the changes to current branch.

If a `preid` is provided it is appended to the release tag.

```json
"scripts": {
  "cutoff-lerna": "cutoff-lerna"
}
```

```bash
yarn run cutoff-lerna
  [--type <major | premajor | minor | preminor | patch | prepatch | prerelease>]
  [--tag <alpha | beta | unstable> [--preid <string>]]
  [--skip-checkout]
  [--dryrun]
  [--force]
```

### publish-cutoff

The script publishes the project to npm with the new version.

```json
"scripts": {
  "publish-cutoff": "publish-cutoff"
}
```

```bash
yarn run publish-cutoff
```

### publish-lerna-cutoff

The script reads the `.lerna.updated.json`, iterates over each package in the list and publishes it to npm with the
new version.

```json
"scripts": {
  "publish-lerna-cutoff": "publish-lerna-cutoff"
}
```

```bash
yarn run publish-lerna-cutoff
```

## Script hooks

### cutoff:pre-version

Any tasks you want to run prior to npm package versions getting updated should be run in this script hook.

```json
"scripts": {
  "cutoff:pre-version": "yarn run pre-version-tasks"
}
```

### cutoff:post-version

Any tasks you want to run after npm package versions have been updated should be run in this script hook.

```json
"scripts": {
  "cutoff:post-version": "yarn run post-version-tasks"
}
```

## Changelog

Check out the [features, fixes and more](CHANGELOG.md) that go into each major, minor and patch version.

## License

Cutoff is [MIT Licensed](LICENSE).
