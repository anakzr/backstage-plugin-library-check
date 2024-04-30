import { LibraryInfo, MetadataLibraries, LibraryTableData } from '../types';

export const processDescriptors = (
  libraries: MetadataLibraries,
  locationUrl: string | undefined,
) => {
  return libraries.descriptors.flatMap(descriptor => {
    return descriptor.result.map(item => {
      const directory: string = item.url.replace(
        locationUrl ? locationUrl.toString() : '',
        '',
      );

      const core: { [key: string]: string } = {};
      const dev: { [key: string]: string } = {};
      const both: { [key: string]: string } = {};

      for (const [key, value] of Object.entries(item.content)) {
        const depType = key.split(':')[0];
        const depName = key.split(':')[1];
        const depGroup = key.split(':')[2];

        if (depType === 'core')
          core[`core:${depName}${depGroup ? `:${depGroup}` : ''}`] = value;
        else if (depType === 'dev')
          dev[`dev:${depName}${depGroup ? `:${depGroup}` : ''}`] = value;
        else if (depType === 'both') {
          both[`both:${depName}${depGroup ? `:${depGroup}` : ''}`] = value;
          core[`both:${depName}${depGroup ? `:${depGroup}` : ''}`] = value;
          dev[`both:${depName}${depGroup ? `:${depGroup}` : ''}`] = value;
        }
      }

      return {
        directory,
        core,
        dev,
        both,
      };
    });
  });
};

export const generateSelectDescriptors = (depsArray: LibraryInfo[]) => {
  return depsArray.map(option => ({
    label: option.directory,
    value: option.directory,
  }));
};

export const countVersions = (deps: LibraryTableData[]) => {
  let majorCount = 0;
  let minorCount = 0;
  let patchCount = 0;
  let upToDateCount = 0;
  let unknownCount = 0;

  deps.forEach((item: any) => {
    if (item.versionRange === 'breaking') {
      majorCount++;
    } else if (item.versionRange === 'minor') {
      minorCount++;
    } else if (item.versionRange === 'patch') {
      patchCount++;
    } else if (item.versionRange === 'unknown') {
      unknownCount++;
    } else if (item.versionRange === 'up-to-date') {
      upToDateCount++;
    }
  });

  return {
    totalDeps: deps?.length,
    breaking: majorCount,
    upToDate: upToDateCount,
    minor: minorCount,
    unknown: unknownCount,
    patch: patchCount,
  };
};

export const sortBySum = (data: any) => {
  return data
    .sort((a: any, b: any) => {
      const sumA = [
        'breaking',
        'minor',
        'patch',
        'unknown',
        'up-to-date',
      ].reduce((sum, prop) => sum + parseInt(a[prop], 10), 0);
      const sumB = [
        'breaking',
        'minor',
        'patch',
        'unknown',
        'up-to-date',
      ].reduce((sum, prop) => sum + parseInt(b[prop], 10), 0);
      return sumB - sumA;
    })
    .slice(0, 25);
};
