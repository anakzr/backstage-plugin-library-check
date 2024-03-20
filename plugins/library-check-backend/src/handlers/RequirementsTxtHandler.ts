import { FileHandler, Libraries } from '../types';

export class RequirementsTxtHandler implements FileHandler {
  read(fileContent: string): Libraries {
    const libraries: Libraries = {};
    const lines = fileContent.split('\n');

    lines.forEach((line: string) => {
      const match = RegExp(/^([^\s=]+)==(.+)$/).exec(line);
      if (match) {
        const packageName = match[1];
        const packageVersion = match[2];
        libraries[`core:${packageName}`] = packageVersion;
      }
    });

    return libraries;
  }
}
