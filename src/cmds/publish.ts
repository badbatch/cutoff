export const builder = {};
export const command = 'publish';
export const desc = 'Publish packages to registry';
export { publish as handler } from '../handlers/publish.js';
