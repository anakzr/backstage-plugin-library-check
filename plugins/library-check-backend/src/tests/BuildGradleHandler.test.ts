import { BuildGradleHandler } from '../handlers/BuildGradleHandler';
import * as g2js from 'gradle-to-js';

// Mocking gradle-to-js module
jest.mock('gradle-to-js');

describe('BuildGradleHandler', () => {
  let buildGradleHandler: BuildGradleHandler;

  beforeEach(() => {
    buildGradleHandler = new BuildGradleHandler();
  });

  describe('read', () => {
    it('should parse file content and return libraries', async () => {
      const fileContent =
        'dependencies {\n  implementation "com.example:library:1.0"\n}';
      const parsedResult = {
        dependencies: [
          { name: 'library', version: '1.0', group: 'com.example' },
        ],
      };

      // Mocking the response of parseText
      (g2js.parseText as jest.Mock).mockResolvedValue(parsedResult);

      // Mocking the response of readAsync
      const readAsyncResult = Promise.resolve(JSON.stringify(parsedResult));
      jest
        .spyOn(buildGradleHandler, 'readAsync')
        .mockReturnValue(readAsyncResult);

      const result = buildGradleHandler.read(fileContent);

      // Expect readAsync to be called with the correct arguments
      expect(buildGradleHandler.readAsync).toHaveBeenCalledWith(fileContent);

      // Wait for the asynchronous operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Expect the result directly since readAsync has been mocked to return the expected value synchronously
      expect(result).toEqual({
        'core:library:com.example': '1.0.0',
      });
    });
  });

  describe('readAsync', () => {
    it('should parse file content asynchronously', async () => {
      const fileContent =
        'dependencies {\n  implementation "com.example:library:1.0"\n}';
      const parsedResult = {
        dependencies: [
          { name: 'library', version: '1.0', group: 'com.example' },
        ],
      };
      (g2js.parseText as jest.Mock).mockResolvedValue(parsedResult);

      const result = await buildGradleHandler.readAsync(fileContent);

      expect(g2js.parseText).toHaveBeenCalledWith(fileContent);
      expect(result).toEqual(JSON.stringify(parsedResult));
    });
  });
});
