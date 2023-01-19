import { dim } from 'colorette';

export default (fieldName: string, fieldVlaue: string[]) =>
  `${fieldName}:${
    fieldVlaue.length ? `\n          ${dim('>')} ${fieldVlaue.join(`\n          ${dim('>')} `)}` : ' None'
  }`;
