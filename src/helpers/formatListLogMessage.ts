import { dim } from 'colorette';

export const formatListLogMessage = (fieldName: string, fieldValues: string[]) =>
  `${fieldName}:${
    fieldValues.length > 0 ? `\n          ${dim('>')} ${fieldValues.join(`\n          ${dim('>')} `)}` : ' None'
  }`;
