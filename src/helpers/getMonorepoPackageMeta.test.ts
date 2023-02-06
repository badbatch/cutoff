import { jest } from '@jest/globals';
import type { PackageJson } from 'type-fest';

jest.unstable_mockModule('./getMonorepoPackageJsonPaths.js', () => ({
  getMonorepoPackageJsonPaths: jest
    .fn()
    .mockReturnValue([
      '/root/apps/client/alpha/package.json',
      '/root/apps/server/bravo/package.json',
      '/root/configs/delta/package.json',
    ]),
}));

jest.unstable_mockModule('./loadPackageJson.js', () => ({
  loadPackageJson: jest.fn<(value: string) => PackageJson>().mockImplementation((path: string) => {
    const match = /\/([a-z]+)\/package.json$/.exec(path)!;
    return { name: match[1]! };
  }),
}));

describe('getMonorepoPackageMeta', () => {
  it('should return the correct package meta', async () => {
    const { getMonorepoPackageMeta } = await import('./getMonorepoPackageMeta.js');

    expect(getMonorepoPackageMeta('pnpm')).toEqual({
      alpha: {
        name: 'alpha',
        path: '/root/apps/client/alpha/package.json',
      },
      bravo: {
        name: 'bravo',
        path: '/root/apps/server/bravo/package.json',
      },
      delta: {
        name: 'delta',
        path: '/root/configs/delta/package.json',
      },
    });
  });
});
