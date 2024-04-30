import { FileHandler, Libraries } from '../types';
import { validateSemverNotation } from '../utils/semver';

export class PackageJsonHandler implements FileHandler {
  read(fileContent: string): Libraries {
    if (fileContent.trim() === '') {
      return {};
    }

    const packageJson = JSON.parse(fileContent);
    const libraries: Libraries = packageJson.dependencies || {};
    const devLibraries: Libraries = packageJson.devDependencies || {};

    const resultLibraries: Libraries = {};

    for (const [key, value] of Object.entries({
      ...libraries,
      ...devLibraries,
    })) {
      let prefix = '';

      if (libraries.hasOwnProperty(key) && devLibraries.hasOwnProperty(key)) {
        prefix = 'both:';
      } else if (libraries.hasOwnProperty(key)) {
        prefix = 'core:';
      } else {
        prefix = 'dev:';
      }

      resultLibraries[`${prefix}${key}`] = validateSemverNotation(value);
    }

    return resultLibraries;
  }
}
