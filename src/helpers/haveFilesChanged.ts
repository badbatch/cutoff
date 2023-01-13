import getChangedFiles from './getChangedFiles.js';

export default (releaseTag: string) => !!getChangedFiles(releaseTag).length;
