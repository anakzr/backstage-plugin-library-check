import { createApiRef } from '@backstage/core-plugin-api';
import {
  Library,
  DistributionType,
  RecordsCountResponse,
} from '@anakz/backstage-plugin-library-check-backend';

export interface LibraryCheckApi {
  getLibrariesData: (deps: string[]) => Promise<Library[]>;
  getStackedChartData: (language: string) => Promise<DistributionType[]>;
  getTotals(resource: string): Promise<RecordsCountResponse>;
  getDistinctLibrariesPerLanguage(): Promise<
    [{ language: string; total: string }] | null
  >;
  getDistinctImpactByEntity(): Promise<
    [{ entity_id: string; type_of_update: string; total: string }] | null
  >;
  getLanguages(): Promise<[{ language: string }] | null>;
}

export const libraryCheckApiRef = createApiRef<LibraryCheckApi>({
  id: 'plugin.library-check.service',
});
