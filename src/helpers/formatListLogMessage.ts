import { dim } from 'colorette';

export const formatListLogMessage = (fieldName: string, fieldVlaue: string[]) =>
  `${fieldName}:${
    fieldVlaue.length ? `\n          ${dim('>')} ${fieldVlaue.join(`\n          ${dim('>')} `)}` : ' None'
  }`;
