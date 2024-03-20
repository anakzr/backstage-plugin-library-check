export const truncate = (str: string, size: number): string => {
  if (!str) return '';

  return str.length > size ? `${str.slice(0, size - 10)}&hellip;` : str;
};
