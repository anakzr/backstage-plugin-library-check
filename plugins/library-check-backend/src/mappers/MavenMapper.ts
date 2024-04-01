import { Library } from '../types';
import { RegistryConfig, RegistryMapper } from './RegistryMapper';
// import { truncate } from '../utils/strings';
import axios from 'axios';

export class MavenMapper implements RegistryMapper {
  map(response: any): Library {
    if (response.code === 'ERR_BAD_REQUEST') {
      const library: Library = {
        name: response.dep.name,
        registry_last_check: new Date().toISOString(),
        language: 'java',
      };

      return library;
    }

    console.log('response from MAVEN:', response);

    const library: Library = {
      name: '',
      description: '',
      latest_version: undefined,
      homepage_url: undefined,
      next_version: undefined,
      repository: undefined,
      bugs_url: undefined,
      engines: undefined,
      registry_last_check: new Date().toISOString(),
      language: 'java',
    };

    return library;
  }

  async fetch(_library: string, _registry: string): Promise<any> {
    const url = RegistryConfig[_registry].url;
    try {
      const response = await axios.get(`${url}?q=${_library}&wt=json`);
      return response.data;
    } catch (error) {
      return { error, dep: { name: _library } };
    }
  }
}
