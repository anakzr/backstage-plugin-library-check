import * as g2js from 'gradle-to-js';
import { Libraries, FileHandler } from '../types';
import { validateSemverNotation } from '../utils/semver';

export class BuildGradleHandler implements FileHandler {
  read(fileContent: string): Libraries {
    const libraries: Libraries = {};
    let result: any;

    const readAsyncResult = this.readAsync(fileContent);
    readAsyncResult
      .then(parsed => {
        result = JSON.parse(parsed);
        const dependencies = result.dependencies;

        if (dependencies) {
          dependencies.forEach((dep: any) => {
            const name = dep.name;
            const version = validateSemverNotation(dep.version);
            // const type = dep.type;
            const group = dep.group;
            const key = `core:${name.replace(/["':]/g, '')}${
              group !== '' ? `:${group}` : ''
            }`;

            libraries[key] = version;
          });
        }
      })
      .catch(error => {
        console.log(error);
      });

    return libraries;
  }

  async readAsync(fileContent: string): Promise<string> {
    try {
      const result = await g2js.parseText(fileContent);
      return JSON.stringify(result);
    } catch (error) {
      throw error;
    }
  }
}
