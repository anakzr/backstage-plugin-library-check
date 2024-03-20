import { Library } from '../types';
import { RegistryConfig, RegistryMapper } from './RegistryMapper';
import { truncate } from '../utils/strings';
import axios from 'axios';

export class PypiResponseMapper implements RegistryMapper {
  map(response: any): Library {
    if (response.code === 'ERR_BAD_REQUEST') {
      const library: Library = {
        name: response.dep.name,
        registry_last_check: new Date().toISOString(),
        language: 'python',
      };

      return library;
    }

    const library: Library = {
      name: response.info?.name.toLowerCase(),
      description: truncate(response?.info?.description, 500) || undefined,
      latest_version: response?.info?.version || undefined,
      homepage_url: response?.info.home_page || undefined,
      next_version: undefined,
      repository: response?.info?.project_urls?.Homepage || undefined,
      bugs_url: response?.info.bugtrack_url || undefined,
      engines: response?.info.requires_python || undefined,
      registry_last_check: new Date().toISOString(),
      language: 'python',
    };

    return library;
  }

  async fetch(_library: string, _registry: string): Promise<any> {
    const url = RegistryConfig[_registry].url;
    try {
      const response = await axios.get(`${url}/pypi/${_library}/json`);
      return response.data;
    } catch (error) {
      return { error, dep: { name: _library } };
    }
  }
}
