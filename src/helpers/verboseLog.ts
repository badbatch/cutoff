import chalk from 'chalk';
import shell from 'shelljs';

const { echo } = shell;
let verbose = false;

export const isVerbose = (value: boolean) => {
  verbose = value;
};

export default (message: string) => {
  if (verbose) {
    echo(`${chalk.magenta('Cutoff')} ${chalk.dim('=>')} ${message}`);
  }
};
