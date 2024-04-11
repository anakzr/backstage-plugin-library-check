import { RequirementsTxtHandler } from '../handlers/RequirementsTxtHandler';

describe('RequirementsTxtHandler', () => {
  let requirementsTxtHandler: RequirementsTxtHandler;

  beforeEach(() => {
    requirementsTxtHandler = new RequirementsTxtHandler();
  });

  describe('read', () => {
    it('should return an empty object if file content is empty', () => {
      const fileContent = '';

      const result = requirementsTxtHandler.read(fileContent);

      expect(result).toEqual({});
    });

    it('should parse file content and return libraries', () => {
      const fileContent = `
        package1==1.0
        package2==2.0
      `;

      const result = requirementsTxtHandler.read(fileContent);

      expect(result).toEqual({
        'core:package1': '1.0.0',
        'core:package2': '2.0.0',
      });
    });

    it('should ignore lines that do not match the package format', () => {
      const fileContent = `
        package1==1.0
        not_a_package_version_line
        package2==2.0
      `;

      const result = requirementsTxtHandler.read(fileContent);

      expect(result).toEqual({
        'core:package1': '1.0.0',
        'core:package2': '2.0.0',
      });
    });

    it('should handle lines with spaces around package names and versions', () => {
      const fileContent = `
        package 1 == 1.0
        package 2 ==2.0
      `;

      const result = requirementsTxtHandler.read(fileContent);

      expect(result).toEqual({
        'core:package1': '1.0.0',
        'core:package2': '2.0.0',
      });
    });

    it('should handle lines with different separator formats', () => {
      const fileContent = `
        package1>=1.0
        package2 2.0
        package3=>=3.0
      `;

      const result = requirementsTxtHandler.read(fileContent);

      expect(result).toEqual({
        'core:package1': '1.0.0',
        'core:package3': '3.0.0',
      });
    });
  });
});
