import axios from 'axios';
import { Library } from '../types';
import { RegistryConfig, RegistryMapper } from './RegistryMapper';
import { truncate } from '../utils/strings';

export class NugetResponseMapper implements RegistryMapper {
  map(_response: any): Library {
    const library: Library = {
      name: _response.id,
      description: truncate(_response.description, 255) || undefined,
      latest_version: _response.version,
      latest_version_date: _response.lastEdited,
      created_at: _response.created,
      modified_at: _response.lastEdited,
      homepage_url: _response['@id'] || undefined,
      repository: _response?.repository,
      bugs_url: _response?.projectUrl || undefined,
      engines: _response?.tags.join(',') || undefined,
      registry_last_check: new Date().toISOString(),
      language: 'csharp',
    };

    return library;
  }

  async fetch(_library: string, _registry: string): Promise<any> {
    // TODO: Consider search on Azure Artifacts
    const url = RegistryConfig[_registry].url;

    // URL FORMAT: https://api.nuget.org/v3/registration3/newtonsoft.json/12.0.3.json
    // EX: newtonsoft.json/12.0.3.json

    const versionsUrl = `${url}/${_library.toLocaleLowerCase()}/index.json`;
    const response = await axios.get(versionsUrl);
    const itemsIndex = response.data.count - 1;
    const latestVersionMetadataIndex =
      response.data.items[itemsIndex].count - 1;

    const upperVersionArrayItems =
      response.data.items[itemsIndex].items ?? false;

    let packageMetadataUrl = '';
    let packageMetadata: any = undefined;

    if (upperVersionArrayItems) {
      packageMetadataUrl =
        response.data.items[itemsIndex].items[latestVersionMetadataIndex]
          ?.catalogEntry['@id'];

      packageMetadata = await axios.get(packageMetadataUrl);

      return packageMetadata.data;
    }

    // Sometimes we don't have the items[] from a version range as result from main registry
    // So we have to Search for the catalogEntryUrl from @id url
    packageMetadataUrl = response.data.items[itemsIndex]['@id'];
    const currentIndexLevelMetadata = await axios.get(packageMetadataUrl);
    const catalogEntryUrl =
      currentIndexLevelMetadata.data.items[latestVersionMetadataIndex]
        .catalogEntry['@id'];

    packageMetadata = await axios.get(catalogEntryUrl);

    return packageMetadata.data;
  }
}
