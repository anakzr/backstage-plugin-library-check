import { PomXmlHandler } from '../handlers/PomXmlHandler';
import * as xml2js from 'xml2js';

// Mocking xml2js module
jest.mock('xml2js', () => ({
  Parser: jest.fn().mockImplementation(() => ({
    parseString: jest.fn(
      (_content: unknown, callback: (err: Error | null, result: any) => void) =>
        callback(null, {
          project: {
            dependencyManagement: { dependencies: { dependency: [] } },
          },
        } as unknown as any),
    ),
  })),
}));

describe('PomXmlHandler', () => {
  let pomXmlHandler: PomXmlHandler;

  beforeEach(() => {
    pomXmlHandler = new PomXmlHandler();
  });

  describe('read', () => {
    it('should handle empty file content', () => {
      const fileContent = '';

      const result = pomXmlHandler.read(fileContent);

      expect(result).toEqual({});
    });

    it('should parse file content and return libraries', () => {
      const fileContent = `
      <project>
        <dependencyManagement>
          <dependencies>
            <dependency>
              <groupId>com.example</groupId>
              <artifactId>library1</artifactId>
              <version>1.0</version>
              <scope>test</scope>
            </dependency>
            <dependency>
              <groupId>com.example</groupId>
              <artifactId>library2</artifactId>
              <version>2.0</version>
            </dependency>
          </dependencies>
        </dependencyManagement>
      </project>`;

      const parsedResult = {
        project: {
          dependencyManagement: {
            dependencies: {
              dependency: [
                {
                  groupId: 'com.example',
                  artifactId: 'library1',
                  version: '1.0',
                  scope: 'test',
                },
                {
                  groupId: 'com.example',
                  artifactId: 'library2',
                  version: '2.0',
                },
              ],
            },
          },
        },
      };

      // Mocking the response of parseString
      (xml2js.Parser as any).mockImplementation(() => ({
        parseString: jest.fn(
          (
            _content: unknown,
            callback: (err: Error | null, result: any) => void,
          ) => callback(null, parsedResult),
        ),
      }));

      const result = pomXmlHandler.read(fileContent);

      expect(xml2js.Parser).toHaveBeenCalledWith({ explicitArray: false });
      expect(result).toEqual({
        'test:library1:com.example': '1.0.0',
        'core:library2:com.example': '2.0.0',
      });
    });

    it('should log error if parsing fails', () => {
      const fileContent = '<invalid-xml>'; // Invalid XML content

      // Mocking the response of parseString
      (xml2js.Parser as any).mockImplementation(() => ({
        parseString: jest.fn(
          (
            _content: unknown,
            callback: (err: Error | null, result: any) => void,
          ) => callback(new Error('Parsing failed'), null),
        ),
      }));

      // Mocking console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = pomXmlHandler.read(fileContent);

      expect(xml2js.Parser).toHaveBeenCalledWith({ explicitArray: false });
      expect(result).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error parsing pom.xml content:',
        expect.any(Error),
      );
    });
  });
});
