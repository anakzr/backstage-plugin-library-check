import { validateSemverNotation } from '../utils/semver';

describe('validateSemverNotation', () => {
  test('Must check if semver notation is valid', () => {
    expect(validateSemverNotation('1.2')).toBe('1.2.0');
    expect(validateSemverNotation('1.2.3')).toBe('1.2.3');
    expect(validateSemverNotation('^1.2.3')).toBe('1.2.3');
    expect(validateSemverNotation('~1.2.3')).toBe('1.2.3');
    expect(validateSemverNotation('1.2.3-alpha')).toBe('1.2.3');
    expect(validateSemverNotation('1.2.3+build.1')).toBe('1.2.3');
    expect(validateSemverNotation('1.2.3-alpha+build.1')).toBe('1.2.3');
    expect(validateSemverNotation('1.2.a')).toBe('1.2.0');
    expect(validateSemverNotation('v1.2.3')).toBe('1.2.3');
    expect(validateSemverNotation('10092023')).toBe('10092023.0.0');
  });

  test('Must throw an empty string if its not valid', () => {
    expect(validateSemverNotation('${itext.version}')).toBe('');
  });
});
