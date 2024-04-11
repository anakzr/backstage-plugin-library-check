import { ComposerJsonHandler } from '../handlers';

describe('ComposerJsonHandler', () => {
  let composerJsonHandler: ComposerJsonHandler;

  beforeEach(() => {
    composerJsonHandler = new ComposerJsonHandler();
  });

  describe('read', () => {
    it('should parse file content and return libraries', () => {
      const fileContent = `
      {
        "require": {
          "package1": "1.0",
          "package2": "2.0"
        },
        "require-dev": {
          "package3": "3.2",
          "package4": "v4.0"
        }
      }`;

      const result = composerJsonHandler.read(fileContent);

      expect(result).toEqual({
        'core:package1': '1.0.0',
        'core:package2': '2.0.0',
        'dev:package3': '3.2.0',
        'dev:package4': '4.0.0',
      });
    });

    it('should handle empty require-dev section', () => {
      const fileContent = `
      {
        "require": {
          "package1": "1.0",
          "package2": "2.0"
        },
        "require-dev": {}
      }`;

      const result = composerJsonHandler.read(fileContent);

      expect(result).toEqual({
        'core:package1': '1.0.0',
        'core:package2': '2.0.0',
      });
    });

    it('should handle empty require section', () => {
      const fileContent = `
      {
        "require": {},
        "require-dev": {
          "package3": "3.0",
          "package4": "4.0"
        }
      }`;

      const result = composerJsonHandler.read(fileContent);

      expect(result).toEqual({
        'dev:package3': '3.0.0',
        'dev:package4': '4.0.0',
      });
    });

    it('should handle empty file content', () => {
      const fileContent = '';

      const result = composerJsonHandler.read(fileContent);

      expect(result).toEqual({});
    });

    it('should handle invalid JSON file content', () => {
      const fileContent = 'invalid JSON';

      expect(() => composerJsonHandler.read(fileContent)).toThrow();
    });
  });
});
