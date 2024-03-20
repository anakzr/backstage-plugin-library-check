export type LibraryTableData = {
  name?: string;
  projectVersion?: string;
  latestVersion?: string;
  nextVersion?: string;
  dateLastVersion?: string;
  issues?: string;
  homepage?: string;
  description?: string;
  type?: 'core' | 'dev';
};

export type LibraryCheckContextInterface = {
  tableData: LibraryTableData[] | [];
  countersData: any;
  isLoading?: boolean;
  hasError?: Error | null;
  selectItems: any[];
  updateContextData: any;
  entityName: string | null;
  organizationName: string | null;
};

export type Descriptor = {
  result: [
    {
      url: string;
      content: {
        [key: string]: string;
      };
    },
  ];
  query: string;
};

export type MetadataLibraries = {
  descriptors: Descriptor[];
};

export type LibraryInfo = {
  directory: string;
  core: { [key: string]: string };
  dev: { [key: string]: string };
  both: { [key: string]: string };
};
