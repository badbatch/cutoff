import { dim, magenta } from 'colorette';
import shell from 'shelljs';

const { echo } = shell;
let verbose = false;

export const isVerbose = (value: boolean) => {
  verbose = value;
};

export const verboseLog = (message: string) => {
  if (verbose) {
    echo(`${magenta('Cutoff')} ${dim('=>')} ${message}`);
  }
};
