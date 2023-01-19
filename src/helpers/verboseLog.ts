import { dim, magenta } from 'colorette';
import shell from 'shelljs';

const { echo } = shell;
let verbose = false;

export const isVerbose = (value: boolean) => {
  verbose = value;
};

export default (message: string) => {
  if (verbose) {
    echo(`${magenta('Cutoff')} ${dim('=>')} ${message}`);
  }
};
