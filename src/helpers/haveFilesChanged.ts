import { getChangedFiles } from './getChangedFiles.js';

export const haveFilesChanged = (releaseTag: string) => !!getChangedFiles(releaseTag).length;
