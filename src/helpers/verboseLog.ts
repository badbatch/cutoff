import { dim, magenta } from 'colorette';
import shelljs from 'shelljs';

let verbose = false;

export const setVerbose = (value: boolean) => {
  verbose = value;
};

export const verboseLog = (message: string) => {
  if (verbose) {
    shelljs.echo(`${magenta('Cutoff')} ${dim('=>')} ${message}`);
  }
};
