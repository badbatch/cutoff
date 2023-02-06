describe('getInternalDepsPackageMeta', () => {
  const packageJson = {
    dependencies: {
      alpha: '1.0.0',
      delta: '1.0.0',
    },
    devDependencies: {
      echo: '1.0.0',
    },
    peerDependencies: {
      charlie: '< 2',
      foxtrot: '< 2',
    },
  };

  const packageMetaRecord = {
    alpha: {
      name: 'alpha',
      path: '/path/to/alpha',
    },
    bravo: {
      name: 'bravo',
      path: '/path/to/bravo',
    },
    charlie: {
      name: 'charlie',
      path: '/path/to/charlie',
    },
  };

  it('should return the correct package meta', async () => {
    const { getInternalDepsPackageMeta } = await import('./getInternalDepsPackageMeta.js');

    expect(getInternalDepsPackageMeta(packageJson, packageMetaRecord)).toEqual([
      {
        name: 'alpha',
        path: '/path/to/alpha',
      },
      {
        name: 'charlie',
        path: '/path/to/charlie',
      },
    ]);
  });
});
