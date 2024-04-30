import { PackageJsonHandler } from '../handlers/PackageJsonHandler';

describe('PackageJsonHandler', () => {
  let packageJsonHandler: PackageJsonHandler;

  beforeEach(() => {
    packageJsonHandler = new PackageJsonHandler();
  });

  describe('read', () => {
    it('should return an empty object if file content is empty', () => {
      const fileContent = '';

      const result = packageJsonHandler.read(fileContent);

      expect(result).toEqual({});
    });

    it('should parse file content and return libraries', () => {
      const fileContent = `
      {
        "dependencies": {
          "package1": "1.0",
          "package2": "2.0"
        },
        "devDependencies": {
          "package3": "3.0"
        }
      }`;

      const result = packageJsonHandler.read(fileContent);

      expect(result).toEqual({
        'core:package1': '1.0.0',
        'core:package2': '2.0.0',
        'dev:package3': '3.0.0',
      });
    });

    it('should handle missing dependencies', () => {
      const fileContent = `
      {
        "devDependencies": {
          "package3": "3.0"
        }
      }`;

      const result = packageJsonHandler.read(fileContent);

      expect(result).toEqual({
        'dev:package3': '3.0.0',
      });
    });

    it('should handle missing devDependencies', () => {
      const fileContent = `
      {
        "dependencies": {
          "package1": "1.0",
          "package2": "2.0"
        }
      }`;

      const result = packageJsonHandler.read(fileContent);

      expect(result).toEqual({
        'core:package1': '1.0.0',
        'core:package2': '2.0.0',
      });
    });

    it('should handle empty dependencies', () => {
      const fileContent = `
      {
        "dependencies": {},
        "devDependencies": {}
      }`;

      const result = packageJsonHandler.read(fileContent);

      expect(result).toEqual({});
    });
  });
});
