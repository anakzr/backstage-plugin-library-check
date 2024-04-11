import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Label,
  LabelList,
  CartesianGrid,
  Legend,
} from 'recharts';
import { InfoCard, Select } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { libraryCheckApiRef } from '../api';
import { sortBySum } from '../helpers';

const renderCustomizedLabel = (props: any) => {
  const { content, value, ...rest } = props;

  return (
    <Label {...rest} fontSize="12" fill="#FFFFFF" fontWeight="Bold">
      {value}
    </Label>
  );
};

const selectItems = [
  {
    label: 'Javascript',
    value: 'javascript',
  },
  {
    label: 'PHP',
    value: 'php',
  },
  {
    label: 'Python',
    value: 'python',
  },
  {
    label: 'C#',
    value: 'csharp',
  },
  {
    label: 'Java',
    value: 'java',
  },
];

export const LibrariesByLanguageCardComponent = () => {
  const [selectedValue, setSelectedValue] = useState(selectItems[0].value);
  const [languages, setLanguages] = useState(selectItems);
  const [chartData, setChartData] = useState([]);
  const libraryCheckApi = useApi(libraryCheckApiRef);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedValue !== '') {
        try {
          const responseData = await libraryCheckApi.getStackedChartData(
            selectedValue,
          );

          setChartData(_ => sortBySum(responseData));
        } catch (error) {
          setIsError(!error);
        }
      }
    };

    fetchData();
  }, [selectedValue, libraryCheckApi]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const responseData = await libraryCheckApi.getLanguages();
        const mappedLanguages = responseData?.map(item => {
          return {
            label: item.language,
            value: item.language,
          };
        });

        setLanguages(mappedLanguages || selectItems);
      } catch (error) {
        setIsError(true);
      }
    };

    fetchLanguages();
  }, [libraryCheckApi]);

  const handleSelectChange = (value: any) => {
    setSelectedValue(String(value));
  };

  return (
    <InfoCard title="Libraries by language" divider={false}>
      <Select
        onChange={handleSelectChange}
        label="Select the language"
        selected={selectedValue}
        items={languages}
      />

      <div>
        {isError ?? <p>There was an error loading the chart</p>}

        <ResponsiveContainer minHeight={800} width="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 25, right: 15, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="2 2" horizontal={false} />
            <XAxis
              type="number"
              tickMargin={5}
              height={75}
              label={{
                value: 'Number of entities',
                position: 'insideBottomCenter',
              }}
            />
            <YAxis
              type="category"
              dataKey="item"
              fontSize={10}
              fontWeight="bold"
              width={95}
              tickLine={false}
            />
            <Tooltip />
            <Legend
              verticalAlign="top"
              height={35}
              margin={{ top: 15, bottom: 35 }}
            />
            <Bar dataKey="breaking" fill="#FE5C51" stackId="a">
              <LabelList
                dataKey="breaking"
                position="center"
                content={renderCustomizedLabel}
              />
            </Bar>
            <Bar dataKey="minor" fill="#FF9800" stackId="a">
              <LabelList
                dataKey="minor"
                position="center"
                content={renderCustomizedLabel}
              />
            </Bar>
            <Bar dataKey="patch" fill="#82b6ef" stackId="a">
              <LabelList
                dataKey="patch"
                position="center"
                content={renderCustomizedLabel}
              />
            </Bar>
            <Bar dataKey="up_to_date" fill="#1DB954" stackId="a">
              <LabelList
                dataKey="up_to_date"
                position="center"
                content={renderCustomizedLabel}
              />
            </Bar>
            <Bar dataKey="unknown" fill="#D4D4D4" stackId="a">
              <LabelList
                dataKey="unknown"
                position="center"
                fontWeight="bold"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </InfoCard>
  );
};

export default LibrariesByLanguageCardComponent;
