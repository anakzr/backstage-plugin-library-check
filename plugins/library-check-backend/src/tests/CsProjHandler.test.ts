import { CsProjHandler } from '../handlers/CsProjHandler';
import * as xml2js from 'xml2js';

// Mocking xml2js module
jest.mock('xml2js', () => ({
  Parser: jest.fn().mockImplementation(() => ({
    parseString: jest.fn((_, callback) =>
      callback(null, { Project: { ItemGroup: [] } }),
    ),
  })),
}));

describe('CsProjHandler', () => {
  let csProjHandler: CsProjHandler;

  beforeEach(() => {
    csProjHandler = new CsProjHandler();
  });

  describe('read', () => {
    it('should handle empty file content', () => {
      const fileContent = '';

      const result = csProjHandler.read(fileContent);

      expect(result).toEqual({});
    });

    it('should parse file content and return libraries', () => {
      const fileContent = `
      <Project>
        <ItemGroup>
          <PackageReference Include="package1" Version="1.0" />
          <PackageReference Include="package2" Version="2.0" DevelopmentLibrary="true" />
        </ItemGroup>
      </Project>`;

      const parsedResult = {
        Project: {
          ItemGroup: [
            {
              PackageReference: [
                { $: { Include: 'package1', Version: '1.0' } },
                {
                  $: {
                    Include: 'package2',
                    Version: '2.0',
                    DevelopmentLibrary: 'true',
                  },
                },
              ],
            },
          ],
        },
      };

      // Mocking the response of parseString
      (xml2js.Parser as unknown as jest.Mock).mockImplementation(() => ({
        parseString: jest.fn((_, callback) => callback(null, parsedResult)),
      }));

      const result = csProjHandler.read(fileContent);

      expect(xml2js.Parser).toHaveBeenCalledWith();
      expect(result).toEqual({
        'core:package1': '1.0.0',
        'dev:package2': '2.0.0',
      });
    });

    it('should log error if parsing fails', () => {
      const fileContent = '<invalid-xml>'; // Invalid XML content

      // Mocking the response of parseString
      (xml2js.Parser as unknown as jest.Mock).mockImplementation(() => ({
        parseString: jest.fn((_, callback) =>
          callback(new Error('Parsing failed'), null),
        ),
      }));

      // Mocking console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = csProjHandler.read(fileContent);

      expect(xml2js.Parser).toHaveBeenCalledWith();
      expect(result).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith(
        'CsProjectHandler: Error parsing .csproj content:',
        expect.any(Error),
      );
    });
  });
});
