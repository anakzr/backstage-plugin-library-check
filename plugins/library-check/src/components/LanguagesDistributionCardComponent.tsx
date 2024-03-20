import React, { useEffect, useState } from 'react';
import { InfoCard } from '@backstage/core-components';
import { ResponsiveContainer, Bar, BarChart, Cell, XAxis } from 'recharts';
import { useApi } from '@backstage/core-plugin-api';
import { libraryCheckApiRef } from '../api';

export const LanguagesDistributionCardComponent = () => {
  const [chartData, setChartData] = useState<
    [{ language: string; total: string }] | null
  >(null);
  const libraryCheckApi = useApi(libraryCheckApiRef);

  useEffect(() => {
    const fetchData = async () => {
      const response = await libraryCheckApi.getDistinctLibrariesPerLanguage();
      setChartData(response);
    };

    fetchData();
  }, [libraryCheckApi]);

  const colors = ['#8a2be2', '#9d5ed8', '#af91cf', '#c2c3c5', '#d8bfd8'];

  return (
    <InfoCard title="Total by language" divider={false}>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart width={50} height={35} data={chartData!} margin={{ top: 25 }}>
          <XAxis dataKey="language" tickLine={false} axisLine={false} />
          <Bar dataKey="total" label={{ position: 'top' }}>
            {chartData?.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % 20]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </InfoCard>
  );
};

export default LanguagesDistributionCardComponent;
