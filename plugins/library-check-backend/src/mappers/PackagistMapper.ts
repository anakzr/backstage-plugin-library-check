import { Library } from '../types';
import { RegistryConfig, RegistryMapper } from './RegistryMapper';
import { truncate } from '../utils/strings';
import axios from 'axios';
import { validateSemverNotation } from '../utils/semver';

export class PackagistResponseMapper implements RegistryMapper {
  map(response: any): Library {
    if (response.code === 'ERR_BAD_REQUEST') {
      const library: Library = {
        name: response.dep.name,
        registry_last_check: new Date().toISOString(),
        language: 'php',
      };

      return library;
    }

    const depName = Object.keys(response.packages)[0];
    const depsVersionsCount = response.packages[depName].length;

    const latestVersion =
      depsVersionsCount > 0 ? response.packages[depName][0] : undefined;

    const firstVersion =
      depsVersionsCount > 0
        ? response.packages[depName][depsVersionsCount - 1]
        : undefined;

    const library: Library = {
      name: depName,
      description: truncate(latestVersion?.description, 255) || undefined,
      latest_version: validateSemverNotation(latestVersion?.version),
      latest_version_date: latestVersion?.time || undefined,
      created_at: firstVersion?.time || undefined,
      modified_at: latestVersion?.time || undefined,
      homepage_url: latestVersion?.homepage
        ? latestVersion.homepage
        : latestVersion.source.url,
      next_version: undefined,
      repository: latestVersion?.source
        ? `+git:${latestVersion?.source?.url}`
        : undefined,
      bugs_url: latestVersion?.support
        ? latestVersion?.support?.issues
        : `${
            latestVersion?.source?.url?.replace('.git', '/issues') || undefined
          }`,
      engines: latestVersion?.require?.php || undefined,
      registry_last_check: new Date().toISOString(),
      language: 'php',
    };

    return library;
  }

  async fetch(_library: string, _registry: string): Promise<any> {
    const url = RegistryConfig[_registry].url;
    try {
      const response = await axios.get(`${url}/p2/${_library}.json`);

      return response.data;
    } catch (error) {
      return { error, dep: { name: _library } };
    }
  }
}
