import { jest } from '@jest/globals';
import type { PackageJson } from 'type-fest';

export const loadPackageJsonMock = () => ({
  loadPackageJson: jest.fn<(value: string) => PackageJson>().mockImplementation((path: string) => {
    const match = /\/([a-z]+)\/package.json$/.exec(path)!;
    return { name: match[1]!, version: '1.0.0' };
  }),
});
