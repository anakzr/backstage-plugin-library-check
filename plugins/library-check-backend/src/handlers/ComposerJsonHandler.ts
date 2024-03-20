import { FileHandler, Libraries } from '../types';

export class ComposerJsonHandler implements FileHandler {
  read(fileContent: string): Libraries {
    const composerJson = JSON.parse(fileContent);
    const libraries: Libraries = composerJson.require;
    const devLibraries: Libraries = composerJson['require-dev'];

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

      resultLibraries[`${prefix}${key}`] = value;
    }

    return resultLibraries;
  }
}
