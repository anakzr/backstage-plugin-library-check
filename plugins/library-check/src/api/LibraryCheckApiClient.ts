import { DiscoveryApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import { LibraryCheckApi } from './index';
import {
  Library,
  DistributionType,
  RecordsCountResponse,
} from '@anakz/backstage-plugin-library-check-backend';
import axios from 'axios';

/**
 * Criando o Client da API
 */
export class LibraryCheckApiClient implements LibraryCheckApi {
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: { discoveryApi: DiscoveryApi }) {
    this.discoveryApi = options.discoveryApi;
  }

  private async fetchSearch<T = any>(payload?: any): Promise<T> {
    const baseUrl = `${await this.discoveryApi.getBaseUrl('')}`;

    const response = await axios.post(
      `${baseUrl}library-check/libraries/search`,
      payload,
    );

    if (!response) throw await ResponseError.fromResponse(response);

    return response.data as Promise<T>;
  }

  private async fetchLibraries<T = any>(resourcePath: string): Promise<T> {
    const baseUrl = `${await this.discoveryApi.getBaseUrl('')}`;

    const response = await axios.get(
      `${baseUrl}library-check/libraries/${resourcePath}`,
    );

    if (!response) throw await ResponseError.fromResponse(response);

    return response.data as Promise<T>;
  }

  private async fetchUpdates<T = any>(resourcePath: string): Promise<T> {
    const baseUrl = `${await this.discoveryApi.getBaseUrl('')}`;

    const response = await axios.get(
      `${baseUrl}library-check/libraries-updates/${resourcePath}`,
    );

    if (!response) throw await ResponseError.fromResponse(response);

    return response.data as Promise<T>;
  }

  async getLibrariesData(deps: string[]): Promise<Library[]> {
    return await this.fetchSearch<Library[]>(deps);
  }

  async getStackedChartData(language: string): Promise<DistributionType[]> {
    return await this.fetchUpdates<DistributionType[]>(
      `distribution?language=${language}`,
    );
  }

  async getTotals(resource: string): Promise<RecordsCountResponse> {
    return await this.fetchUpdates<RecordsCountResponse>(`count?${resource}`);
  }

  async getDistinctLibrariesPerLanguage(): Promise<
    [{ language: string; total: string }] | null
  > {
    return await this.fetchUpdates<
      [{ language: string; total: string }] | null
    >(`languages/totals`);
  }

  async getDistinctImpactByEntity(): Promise<
    [{ entity_id: string; type_of_update: string; total: string }] | null
  > {
    return await this.fetchUpdates<
      [{ entity_id: string; type_of_update: string; total: string }] | null
    >(`updates/entities`);
  }

  async getLanguages(): Promise<any> {
    return await this.fetchLibraries<any | null>(`languages`);
  }
}
