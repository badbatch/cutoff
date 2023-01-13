import handlePublish from '../handlers/publish.js';

export default {
  builder: {},
  command: 'publish',
  desc: 'Publish packages to registry',
  handler: handlePublish,
};
