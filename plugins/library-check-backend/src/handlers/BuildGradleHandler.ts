import { Libraries, FileHandler } from '../types';

export class BuildGradleHandler implements FileHandler {
  read(fileContent: string): Libraries {
    const libraries: Libraries = {};

    // Regex pattern to match dependency declarations
    const dependencyPattern =
      /(?:implementation|compile|api|compileOnly|runtimeOnly|testImplementation|integrationTestImplementation)\s+(?:group:\s+)?['"]?([^:'"]+)['"]?,\s+(?:name:\s+)?['"]?([^:'"]+)['"]?,\s+(?:version:\s+)?['"]?([^:'"]+)['"]?/g;

    fileContent.split('\n').forEach(line => {
      // Remover espaços em branco e comentários
      const trimmedLine = line.trim();
      if (
        !trimmedLine ||
        trimmedLine.startsWith('//') ||
        trimmedLine.startsWith('/*')
      ) {
        return; // Ignorar linhas em branco e comentários
      }

      // Executar a expressão regular na linha
      const match = dependencyPattern.exec(trimmedLine);

      if (match) {
        const dependencyType = match[1] ? match[1].trim() : 'implementation';
        const groupId = match[2];
        const artifactId = match[3];
        const version = match[4];
        const key = `${dependencyType}:${groupId}:${artifactId}`;
        libraries[key] = version;
      }
    });

    return libraries;
  }
}
