import {
  Library,
  LibraryUpdateRecord,
  DistributionType,
  RecordsCountResponse,
} from '../types';

export type MaybeLibrary = Library | null;
export type MaybeLibraries = Library[] | null;
export type MaybeRecords = LibraryUpdateRecord[] | null;

export interface LibraryCheckStore {
  // Libraries
  createLibraries(deps: Library[]): Promise<MaybeLibraries>;
  createLibrary(dep: Library): Promise<MaybeLibrary>;
  readLibrary(name: string): Promise<MaybeLibrary>;
  listLibraries(): Promise<MaybeLibraries>;
  readLibrariesByName(deps: string[] | Library[]): Promise<MaybeLibraries>;
  updateLibrary(dep: Library): Promise<MaybeLibrary>;
  deleteLibrary(name: string): Promise<boolean>;
  searchLibraries(query?: any): Promise<MaybeLibraries>;
  // Records
  createLibraryUpdateRecord(deps: LibraryUpdateRecord[]): Promise<any>;
  readRecordsByNames(deps: string[]): Promise<MaybeRecords>;
  searchRecordsByQuery(query?: any): Promise<MaybeRecords>;
  countTotals(): Promise<number | null>;
  countTotalsByQuery(query?: any): Promise<RecordsCountResponse | null>;
  countTotalRecordsByEntity(entity: string): Promise<number | null>;
  countTotalRecordsByLibrary(dep: string): Promise<number | null>;
  countTotalRecordsByLanguage(language: string): Promise<number | null>;
  getImpactDistributionByQuery(query?: any): Promise<DistributionType[] | null>;
  getImpactDistributionByLibraries(): Promise<DistributionType[] | null>;
  getImpactDistributionByEntities(): Promise<DistributionType[] | null>;
  getImpactDistributionByLanguages(): Promise<DistributionType[] | null>;
  getDistinctLibrariesPerLanguage(): Promise<
    [{ language: string; total: string }] | null
  >;
  getDistinctImpactByEntity(): Promise<
    [{ entity_id: string; type_of_update: string; total: string }] | null
  >;
  getLanguages(): Promise<[{ language: string }] | null>;
}
