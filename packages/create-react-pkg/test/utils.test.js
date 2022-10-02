import { sanitizePackageName } from '../src/utils';

describe('utils', () => {
  it('should generate safe package name', () => {
    expect(sanitizePackageName('@foo/bar')).toBe('bar');
    expect(sanitizePackageName('@foo/bar-')).toBe('bar');
    expect(sanitizePackageName('@foo/bar-baz')).toBe('bar-baz');
    expect(sanitizePackageName('@FOO/BAR')).toBe('bar');
    expect(sanitizePackageName('bar')).toBe('bar');
    expect(sanitizePackageName('foo-baR')).toBe('foo-bar');
  });
});
