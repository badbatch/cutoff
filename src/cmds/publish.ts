import { publish } from '../handlers/publish.js';

export const builder = {};
export const command = 'publish';
export const desc = 'Publish packages to registry';
export const handler = publish;
