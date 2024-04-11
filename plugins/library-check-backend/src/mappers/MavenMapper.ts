import { Library } from '../types';
import { validateSemverNotation } from '../utils/semver';
import { RegistryConfig, RegistryMapper } from './RegistryMapper';
import axios from 'axios';

export class MavenResponseMapper implements RegistryMapper {
  map(response: any): Library {
    if (response.code === 'ERR_BAD_REQUEST') {
      const library: Library = {
        name: response.dep.name,
        registry_last_check: new Date().toISOString(),
        language: 'java',
      };

      return library;
    }

    const docs = response.response.docs[0];

    const library: Library = {
      name: `${docs.a}:${docs.g}`,
      description: undefined,
      latest_version: validateSemverNotation(docs.latestVersion),
      latest_version_date: new Date(docs.timestamp).toISOString(),
      homepage_url: docs.g,
      next_version: undefined,
      repository: docs.repositoryId,
      bugs_url: undefined,
      engines: docs.p,
      registry_last_check: new Date().toISOString(),
      language: 'java',
    };

    return library;
  }

  async fetch(_library: string, _registry: string): Promise<any> {
    const [artifactId, groupId] = _library.split(':');
    const url = RegistryConfig[_registry].url;

    try {
      // https://search.maven.org/solrsearch/select?q=g:${groupId}+AND+a:${artifactId}&rows=20&wt=json

      const response = await axios.get(
        `${url}?q=g:${groupId}+AND+a:${artifactId}&rows=20&wt=json`,
      );
      return response.data;
    } catch (error) {
      return { error, dep: { name: _library } };
    }
  }
}
