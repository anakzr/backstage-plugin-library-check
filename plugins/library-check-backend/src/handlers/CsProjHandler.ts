import * as xml2js from 'xml2js';
import { FileHandler, Libraries } from '../types';

export class CsProjHandler implements FileHandler {
  read(fileContent: string): Libraries {
    const libraries: Libraries = {};

    const parser = new xml2js.Parser();

    parser.parseString(fileContent, (err: any, result: any) => {
      if (err) {
        console.log('CsProjectHandler: Error parsing .csproj content:', err);
        return;
      }

      const itemGroups = result.Project.ItemGroup;

      if (itemGroups) {
        itemGroups.forEach((itemGroup: any) => {
          if (itemGroup.PackageReference) {
            itemGroup.PackageReference.forEach((packageRef: any) => {
              const name = packageRef.$.Include;
              const version = packageRef.$.Version;
              // Check if it's a development library
              const isDevLibrary = packageRef.$.DevelopmentLibrary === 'true';
              const usage: 'core' | 'dev' | 'both' = isDevLibrary
                ? 'dev'
                : 'core';

              const key = `${usage}:${name}`;
              const value = version;

              libraries[key] = value;
            });
          }
        });
      }
    });

    return libraries;
  }
}
