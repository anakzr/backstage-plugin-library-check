/* eslint-disable no-nested-ternary */
import React, { useContext } from 'react';
import {
  Progress,
  Table,
  TableColumn,
  TableFilter,
} from '@backstage/core-components';
import { LibraryCheckContext } from '../context/LibraryCheckContext';
import { useLibrarySearch } from '../hooks/useLibrarySearch';
import { LibrarySearchDialog } from './LibrarySearchDialog';
import { Alert } from '@material-ui/lab';

export const SemverBadge = ({ status }: { status: string }) => {
  let color: string;

  if (status === 'breaking') {
    color = '#FE5C51';
  } else if (status === 'minor') {
    color = '#FF9800';
  } else if (status === 'up-to-date') {
    color = '#1DB954';
  } else if (status === 'patch') {
    color = '#82b6ef';
  } else {
    color = '#9E9E9E';
  }

  const style = {
    color,
    fontWeight: 700,
  };

  return <span style={style}>{status}</span>;
};

export const LibraryCheckTable = () => {
  const {
    isDialogOpen,
    openDialog,
    closeDialog,
    searchResult,
    isGithubAvailable,
    searchError,
  } = useLibrarySearch();

  const { isLoading, hasError, tableData, entityName, organizationName } =
    useContext(LibraryCheckContext);

  const columns: TableColumn[] = [
    {
      title: 'Name',
      field: 'name',
      cellStyle: { fontWeight: 600, width: '30%' },
    },
    { title: 'Type', field: 'type', width: 'auto' },
    {
      title: 'Project version',
      field: 'projectVersion',
      cellStyle: {
        fontWeight: 600,
        background: 'rgba(0,0,0,0.05)',
        width: 'auto',
      },
    },
    {
      title: 'Latest release',
      field: 'latestVersion',
      cellStyle: { fontWeight: 700, width: 'auto' },
    },

    {
      title: 'Date latest release',
      field: 'dateLastVersionMoment',
      sorting: false,
    },

    {
      title: 'Impact',
      field: 'versionRange',
      render: (row: Partial<any>) => {
        return <SemverBadge status={row.versionRange} />;
      },
    },

    { title: 'Next release', field: 'nextVersion' },
  ];

  const filters: TableFilter[] = [
    {
      column: 'Type',
      type: 'select',
    },
    {
      column: 'Impact',
      type: 'multiple-select',
    },
  ];

  const handleRowClick = (rowData: any) => {
    const libraryName = rowData.target.parentNode.firstChild.innerText;
    const repoName = entityName;
    openDialog(libraryName, `${organizationName}/${repoName}` ?? '');
  };

  if (isLoading) {
    return <Progress />;
  }

  return (
    <>
      {hasError && (
        <Alert severity="error" style={{ marginBottom: 20 }}>
          {hasError?.message}
        </Alert>
      )}

      <Table
        options={{
          header: true,
          showTitle: true,
          search: true,
          paging: false,
          padding: 'dense',
          sorting: true,
          loadingType: 'overlay',
        }}
        filters={filters}
        columns={columns}
        data={tableData || []}
        onRowClick={handleRowClick}
      />

      {isGithubAvailable && (
        <LibrarySearchDialog
          isOpen={isDialogOpen}
          onClose={closeDialog}
          libraryName={searchResult?.libraryName ?? ''}
          searchResult={searchResult?.data || null}
          searchError={searchError}
        />
      )}
    </>
  );
};
