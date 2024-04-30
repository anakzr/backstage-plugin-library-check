import * as xml2js from 'xml2js';
import { Libraries, FileHandler } from '../types';
import { validateSemverNotation } from '../utils/semver';

export class PomXmlHandler implements FileHandler {
  read(fileContent: string): Libraries {
    const libraries: Libraries = {};
    const parser = new xml2js.Parser({ explicitArray: false });

    parser.parseString(fileContent, (err: any, result: any) => {
      if (err) {
        console.log('Error parsing pom.xml content:', err);
        return;
      }

      const dependencies =
        result.project.dependencyManagement.dependencies.dependency;

      if (dependencies) {
        dependencies.forEach((dep: any) => {
          const groupId = dep.groupId;
          const artifactId = dep.artifactId;
          const version = validateSemverNotation(dep.version);
          let config = 'core'; // Default configuration
          if (dep.scope === 'test') {
            config = 'test';
          } else if (dep.scope === 'provided') {
            config = 'provided';
          }
          const key = `${config}:${artifactId}:${groupId}`;
          libraries[key] = version;
        });
      }
    });

    return libraries;
  }
}
