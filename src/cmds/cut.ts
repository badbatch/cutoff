import type { Argv } from 'yargs';
import handleCut from '../handlers/cut.js';

export default {
  builder: (argv: Argv) =>
    argv
      .positional('type', {
        desc: 'The release type: major | premajor | minor | preminor | patch | prepatch | prerelease',
        type: 'string',
      })
      .option('tag', {
        desc: 'The release tag: alpha | beta | unstable',
        type: 'string',
      })
      .option('dry-run', {
        desc: 'The release tag: alpha | beta | unstable',
        type: 'boolean',
      })
      .option('preid', {
        desc: 'The pre release ID',
        type: 'string',
      })
      .option('skip-posthook', {
        desc: 'To skip post version lifecycle hook',
        type: 'boolean',
      })
      .option('skip-prehook', {
        desc: 'To skip pre version lifecycle hook',
        type: 'boolean',
      }),
  command: 'cut <type>',
  desc: 'Cut release to current branch',
  handler: handleCut,
};
