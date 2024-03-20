import React, { useEffect, useState } from 'react';
import { InfoCard } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { libraryCheckApiRef } from '../api';
import { Typography } from '@material-ui/core';

export const TotalLibrariesCardComponent = () => {
  const [count, setCount] = useState<any>(0);
  const libraryCheckApi = useApi(libraryCheckApiRef);

  useEffect(() => {
    const fetchData = async () => {
      const response = await libraryCheckApi.getTotals('records=all');
      setCount(response.total);
    };

    fetchData();
  }, [libraryCheckApi]);

  return (
    <InfoCard title="Total unique libraries" divider={false}>
      <Typography variant="h1">{count?.total}</Typography>
    </InfoCard>
  );
};

export default TotalLibrariesCardComponent;
