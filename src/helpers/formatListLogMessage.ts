import chalk from 'chalk';

export default (fieldName: string, fieldVlaue: string[]) =>
  `${fieldName}:${
    fieldVlaue.length ? `\n          ${chalk.dim('>')} ${fieldVlaue.join(`\n          ${chalk.dim('>')} `)}` : ' None'
  }`;
