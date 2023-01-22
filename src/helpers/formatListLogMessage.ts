import { dim } from 'colorette';

export const formatListLogMessage = (fieldName: string, fieldVlaue: string[]) =>
  `${fieldName}:${
    fieldVlaue.length > 0 ? `\n          ${dim('>')} ${fieldVlaue.join(`\n          ${dim('>')} `)}` : ' None'
  }`;
