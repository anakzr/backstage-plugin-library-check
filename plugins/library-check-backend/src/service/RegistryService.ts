import { Library } from '../types';
import {
  NpmResponseMapper,
  PypiResponseMapper,
  PackagistResponseMapper,
  NugetResponseMapper,
} from '../mappers/index';

import {
  LanguageToRegistryMap,
  RegistryMapper,
} from '../mappers/RegistryMapper';

export class RegistryService {
  private readonly mappers: Record<string, RegistryMapper>;

  constructor() {
    this.mappers = {
      npm: new NpmResponseMapper(),
      packagist: new PackagistResponseMapper(),
      pypi: new PypiResponseMapper(),
      nuget: new NugetResponseMapper(),
    };
  }

  private resolveMapper(registryType: string): RegistryMapper {
    const mapper = this.mappers[registryType];

    if (!mapper) {
      throw new Error('Mapper not found for registry type');
    }
    return mapper;
  }

  async fetchRegistryData(library: {
    name: string;
    language: string;
  }): Promise<Library> {
    const registryType = this.getRegistryType(library.language);

    if (!registryType) {
      throw new Error('Registry type not found for the language');
    }

    const mapper = this.resolveMapper(registryType);
    const response = await mapper.fetch(library.name, registryType);
    const mappedData = mapper.map(response);

    return mappedData;
  }

  private getRegistryType(language: string): string | undefined {
    return LanguageToRegistryMap[language];
  }
}
