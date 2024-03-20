export const versionToObj = (version?: string) => {
  if (!version) return {};

  const [major, minor, patch] = version
    .replace(/[~^>=]|[A-Za-z]/g, '')
    .split('.')
    .map((v: string | number) => +v);
  return { major, minor, patch };
};

export const semverImpact = (
  next: any,
  current: any,
): 'breaking' | 'minor' | 'patch' | 'unknown' => {
  const isBreaking = next.major > current.major;
  const isMinor = next.minor > current.minor;
  const isEmpty = (obj: any) => Object.keys(obj).length === 0;

  if (isEmpty(next) || isEmpty(current)) {
    return 'unknown';
  }

  if (isBreaking) {
    return 'breaking';
  } else if (isMinor) {
    return 'minor';
  }
  return 'patch';
};
