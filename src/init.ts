import yargs from 'yargs';
import cut from './cmds/cut.js';
import publish from './cmds/publish.js';

export default () => {
  yargs.command(cut).command(publish).help().argv;
};
