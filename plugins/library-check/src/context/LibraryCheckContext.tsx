import {
  useAsyncEntity,
  getEntitySourceLocation,
} from '@backstage/plugin-catalog-react';
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { scmIntegrationsApiRef } from '@backstage/integration-react';
import { LibraryCheckContextInterface, MetadataLibraries } from '../types';
import { useLibraryFetcher } from '../hooks/useLibraryFetcher';
import {
  countVersions,
  generateSelectDescriptors,
  processDescriptors,
} from '../helpers';

export const libraryCheckDefaultValues: LibraryCheckContextInterface = {
  countersData: {},
  tableData: [
    {
      name: '',
      projectVersion: '',
      latestVersion: '',
      nextVersion: '',
      dateLastVersion: '',
      issues: '',
      homepage: '',
      description: '',
      type: 'core',
    },
  ],
  isLoading: false,
  hasError: null,
  selectItems: [{}],
  entityName: null,
  organizationName: null,
  updateContextData: () => {},
};

export const LibraryCheckContext = createContext<LibraryCheckContextInterface>(
  libraryCheckDefaultValues,
);

export const useIsProjectLibrariesAvailable = () => {
  const { entity } = useAsyncEntity();
  const { libraries } = entity!.metadata;

  return !!(libraries as MetadataLibraries);
};

export const LibraryCheckProvider = ({ children }: PropsWithChildren<{}>) => {
  const { entity } = useAsyncEntity();
  const { libraries } = entity!.metadata;
  const [selectedLibrary, setSelectedLibrary] = useState<string>('');
  const scmIntegrationsApi = useApi(scmIntegrationsApiRef);
  const entitySourceLocation = getEntitySourceLocation(
    entity!,
    scmIntegrationsApi,
  );

  const originLocation = entitySourceLocation?.locationTargetUrl;
  const organizationName = originLocation?.split('/')[3];

  const entityLibraries = useMemo(
    () =>
      processDescriptors(
        libraries as MetadataLibraries,
        entitySourceLocation?.locationTargetUrl,
      ),
    [libraries, entitySourceLocation?.locationTargetUrl],
  );

  const selectDescriptors = useMemo(
    () => generateSelectDescriptors(entityLibraries),
    [entityLibraries],
  );

  const { updateContextData, libraryData } = useLibraryFetcher();

  const handleSelectedLibraryChange = useCallback(
    (selectedValue: string) => {
      if (selectedValue) {
        updateContextData(selectedValue, entityLibraries);
      }
    },
    [updateContextData, entityLibraries],
  );

  const value = {
    entityName: entity?.metadata.name ?? null,
    organizationName: organizationName ?? null,
    tableData: libraryData,
    countersData: countVersions(libraryData),
    isLoading: false,
    hasError: null,
    selectItems: selectDescriptors,
    selectedLibrary,
    setSelectedLibrary,
    updateContextData: handleSelectedLibraryChange,
  };

  return (
    <LibraryCheckContext.Provider value={value}>
      {children}
    </LibraryCheckContext.Provider>
  );
};

export const useLibraryCheck = () => {
  const libraryCheckContextData = useContext(LibraryCheckContext);
  if (libraryCheckContextData === undefined) {
    throw new Error(
      'useLibraryCheck must be used within a LibraryCheckProvider',
    );
  }
  return libraryCheckContextData;
};
