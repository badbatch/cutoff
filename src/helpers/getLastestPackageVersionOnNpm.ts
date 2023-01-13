import shelljs from 'shelljs';

const { exec } = shelljs;

export default (name: string) => exec(`npm view ${name} version`).stdout;
