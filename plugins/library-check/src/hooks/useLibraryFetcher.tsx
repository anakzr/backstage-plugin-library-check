import { useApi } from '@backstage/core-plugin-api';
import { useState, useCallback } from 'react';
import { libraryCheckApiRef } from '../api';
import { LibraryInfo, LibraryTableData } from '../types';
import { Library } from '@anakz/backstage-plugin-library-check-backend';
import { semverImpact, semverToObj, timeAgo } from '../helpers';

const formatLibraries = (depsPrefixed: {}) => {
  const dev: any = {};
  const core: any = {};

  Object.entries(depsPrefixed).forEach((library: any) => {
    const [type, ...nameParts] = library[0].split(':');
    const name = nameParts.join(':');

    if (type === 'both') {
      dev[name] = `${name}+${library[1]}`;
      core[name] = `${name}+${library[1]}`;
    } else if (type === 'dev') {
      dev[name] = `${name}+${library[1]}`;
    } else if (type === 'core') {
      core[name] = `${name}+${library[1]}`;
    }
  });

  return { dev, core };
};

const mapDepsToTable = (
  depsWithData: any,
  entityDepsObj: {},
): LibraryTableData[] => {
  const { dev, core } = formatLibraries(entityDepsObj);

  const tableData: LibraryTableData[] = depsWithData.map((dep: Library) => {
    const extractVersion = (item: string) =>
      item.includes('+') ? item.split('+')[1] : item;

    const isDev = Object.keys(dev).some(d => d === dep.name) || false;

    const currentVersion = isDev
      ? extractVersion(dev[dep.name])
      : extractVersion(core[dep.name]);

    const impact = semverImpact(
      semverToObj(dep?.latest_version),
      semverToObj(currentVersion),
    );

    return {
      name: dep.name.split(':')[0],
      type: isDev ? 'dev' : 'core',
      projectVersion: currentVersion === '' ? 'unknown' : currentVersion,
      semverProject: semverToObj(currentVersion) ?? 'unknown',
      latestVersion: dep.latest_version ?? 'unknown',
      semverLatest: semverToObj(dep.latest_version),
      nextVersion: dep.next_version ?? 'unknown',
      dateLastVersion: dep?.latest_version_date ?? 'unknown',
      dateLastVersionMoment: dep?.latest_version_date
        ? timeAgo(new Date(dep?.latest_version_date))
        : 'unknown',
      issues: dep.bugs_url,
      homepage: dep.homepage_url,
      description: dep.description,
      versionRange: impact,
    };
  });

  return tableData.sort(
    (a: any, b: any) =>
      Date.parse(b.dateLastVersion) - Date.parse(a.dateLastVersion),
  );
};

// Custom hook for handling library updates
export const useLibraryFetcher = () => {
  const [libraryData, setLibraryData] = useState<LibraryTableData[]>([]);

  const libraryCheckApi = useApi(libraryCheckApiRef);

  const updateContextData = useCallback(
    async (descriptorSelected: string, depsArray: LibraryInfo[]) => {
      const targetObject = depsArray.find(
        dep => dep.directory === descriptorSelected,
      );

      if (!targetObject) {
        setLibraryData([]);
        return;
      }

      const { core, dev, both } = targetObject;
      const librariesObject = { ...core, ...dev, ...both };
      const valuesArray = Object.keys(librariesObject);

      const unprefixedDeps = valuesArray.map(dep =>
        dep.replace(/^(both:|core:|dev:|__)/, ''),
      );

      const enhancedDeps = await libraryCheckApi.getLibrariesData(
        unprefixedDeps,
      );

      const mappedDepsDataToTable = mapDepsToTable(
        enhancedDeps,
        librariesObject,
      );

      setLibraryData(mappedDepsDataToTable);
    },
    [libraryCheckApi],
  );

  return { libraryData, updateContextData };
};
