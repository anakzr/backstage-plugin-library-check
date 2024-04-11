import { FileHandler, Libraries } from '../types';
import { validateSemverNotation } from '../utils/semver';

export class RequirementsTxtHandler implements FileHandler {
  read(fileContent: string): Libraries {
    if (!fileContent.trim()) {
      return {};
    }

    const lines = fileContent.split('\n');
    const libraries: Libraries = {};

    for (const line of lines) {
      const trimmedLine = line.trim();
      const operatorIndex = trimmedLine.search(/[<>=]=?/); // Encontra o primeiro operador
      if (operatorIndex === -1) {
        continue;
      }

      const packageName = trimmedLine.slice(0, operatorIndex).trim();
      const packageVersion = trimmedLine
        .slice(operatorIndex)
        .trim()
        .replace(/\s/g, '');

      const formattedPackageName = `core:${packageName.replace(/\s/g, '')}`;

      libraries[formattedPackageName] = validateSemverNotation(packageVersion);
    }

    return libraries;
  }
}
