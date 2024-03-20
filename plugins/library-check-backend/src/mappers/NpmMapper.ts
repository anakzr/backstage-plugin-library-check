import { truncate } from '../utils/strings';
import { Library } from '../types';
import { RegistryMapper, RegistryConfig } from './RegistryMapper';
import axios from 'axios';

export class NpmResponseMapper implements RegistryMapper {
  map(response: any): Library {
    if (response.code === 'ERR_BAD_REQUEST') {
      const library: Library = {
        name: response.dep.name,
        registry_last_check: new Date().toISOString(),
        language: 'javascript',
      };

      return library;
    }

    const library: Library = {
      name: response.name,
      description: truncate(response?.description, 255) || undefined,
      latest_version: response['dist-tags']?.latest || undefined,
      latest_version_date:
        response?.time[response['dist-tags']?.latest] || undefined,
      created_at: response?.time?.created || undefined,
      modified_at: response?.time?.modified || undefined,
      homepage_url: response?.homepage || undefined,
      next_version: response['dist-tags'].next || undefined,
      repository: response?.repository ? response?.repository.url : undefined,
      bugs_url: response?.bugs ? response.bugs?.url : undefined,
      engines: response?.engines || undefined,
      registry_last_check: new Date().toISOString(),
      language: 'javascript',
    };

    return library;
  }

  async fetch(_library: string, _registry: string): Promise<any> {
    const url = RegistryConfig[_registry].url;
    try {
      const response = await axios.get(`${url}/${_library}`);

      return response.data;
    } catch (error) {
      return { error, dep: { name: _library } };
    }
  }
}
