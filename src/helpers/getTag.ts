export default (version: string): string | undefined => {
  if (version.includes('alpha')) {
    return 'alpha';
  }

  if (version.includes('beta')) {
    return 'beta';
  }

  const matches = version.match(new RegExp('(unstable(.*))\\.\\d+'));

  if (matches) {
    return matches[1];
  }

  return undefined;
};
