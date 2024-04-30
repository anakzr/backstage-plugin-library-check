export const semverToObj = (version?: string) => {
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
): 'breaking' | 'minor' | 'patch' | 'unknown' | 'up-to-date' => {
  const isBreaking = next.major > current.major;
  const isMinor = next.minor > current.minor;
  const isOnTrack =
    next.minor === current.minor &&
    next.major === current.major &&
    next.patch === current.patch;
  const isEmpty = (obj: any) => Object.keys(obj).length === 0;

  if (isEmpty(next) || isEmpty(current)) {
    return 'unknown';
  }

  if (isBreaking) {
    return 'breaking';
  } else if (isMinor) {
    return 'minor';
  } else if (isOnTrack) {
    return 'up-to-date';
  }
  return 'patch';
};
