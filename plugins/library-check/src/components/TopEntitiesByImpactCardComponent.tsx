import React, { useEffect, useState } from 'react';
import {
  InfoCard,
  Select,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { libraryCheckApiRef } from '../api';
import { SemverBadge } from './LibraryCheckTable';

type TableData = { entity_id: string; type_of_update: string; total: string }[];

const selectItems = [
  {
    label: 'Major (breaking)',
    value: 'breaking',
  },
  {
    label: 'Minor',
    value: 'minor',
  },
  {
    label: 'Patch',
    value: 'patch',
  },
  {
    label: 'Unknown',
    value: 'unknown',
  },
];

const filterTableData = (data: any[] | undefined, filterValue: string) => {
  return data?.filter(item => item.type_of_update === filterValue) || [];
};

export const TopEntitiesByImpactCardComponent = () => {
  const [selectedValue, setSelectedValue] = useState(selectItems[0].value);
  const [originalTableData, setOriginalTableData] = useState<TableData | null>(
    null,
  );
  const [tableData, setTableData] = useState<TableData | null>(null);
  const libraryCheckApi = useApi(libraryCheckApiRef);
  const [isError, setIsError] = useState(false);

  const columns: TableColumn[] = [
    {
      title: 'Entity',
      field: 'entity_id',
      cellStyle: { fontWeight: 600, width: '30%' },
    },
    {
      title: 'Impact',
      field: 'type_of_update',
      render: (row: Partial<any>) => {
        return <SemverBadge status={row.type_of_update} />;
      },
    },
    {
      title: 'Total libraries',
      field: 'total',
      cellStyle: {
        fontWeight: 600,
        background: 'rgba(0,0,0,0.05)',
        width: 'auto',
      },
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseData = await libraryCheckApi.getDistinctImpactByEntity();

        setOriginalTableData(responseData);
        setTableData(responseData);
      } catch (error) {
        setIsError(!error);
      }
    };

    fetchData();
  }, [libraryCheckApi]);

  useEffect(() => {
    if (selectedValue !== '') {
      setTableData(_ => {
        return filterTableData(originalTableData!, selectedValue);
      });
    }
  }, [selectedValue, originalTableData]);

  const handleSelectChange = (value: any) => {
    setSelectedValue(String(value));
  };

  return (
    <InfoCard title="Top entities affected by changes" divider={false}>
      {isError ?? <p>There was an error loading the chart</p>}
      <Select
        onChange={handleSelectChange}
        label="Select the type of impact"
        selected={selectedValue}
        items={selectItems}
      />

      <Table
        options={{
          header: true,
          showTitle: true,
          search: false,
          paging: false,
          filtering: false,
          toolbar: false,
          padding: 'dense',
          sorting: true,
          loadingType: 'overlay',
        }}
        style={{
          boxShadow: 'none',
          width: '100%',
          marginTop: 25,
        }}
        columns={columns}
        data={tableData || []}
      />
    </InfoCard>
  );
};

export default TopEntitiesByImpactCardComponent;
