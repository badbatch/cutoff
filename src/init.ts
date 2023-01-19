import yargs from 'yargs';
import * as cut from './cmds/cut.js';
import * as publish from './cmds/publish.js';

export default () => {
  yargs.command(cut).command(publish).help().argv;
};
