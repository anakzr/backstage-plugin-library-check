import React, { useContext, useEffect, useState } from 'react';
import { LibraryCheckContext } from '../context/LibraryCheckContext';
import { CacheProvider } from '../context';
import { LibraryCheckTable } from './LibraryCheckTable';
import {
  InfoCard,
  Select,
  StatusAborted,
  StatusError,
  StatusOK,
  StatusRunning,
  StatusWarning,
  StructuredMetadataTable,
} from '@backstage/core-components';

export const LibraryCheckRoot = () => {
  const { selectItems, updateContextData, countersData } =
    useContext(LibraryCheckContext);

  const [selectedValue, setSelectedValue] = useState(selectItems[0].value);

  useEffect(() => {
    if (selectedValue !== '') {
      updateContextData(selectedValue);
    }
  }, [selectedValue, updateContextData]);

  const metadata = {
    'Total Libraries': <StatusAborted>{countersData.totalDeps}</StatusAborted>,
    'Up-To-Date': <StatusOK>{countersData.upToDate}</StatusOK>,
    'Breaking (major)': <StatusError>{countersData.breaking}</StatusError>,
    minor: <StatusWarning>{countersData.minor}</StatusWarning>,
    patch: <StatusRunning>{countersData.patch}</StatusRunning>,
    unknown: <StatusAborted>{countersData.unknown}</StatusAborted>,
  };

  return (
    <CacheProvider>
      <div>
        <div style={{ gap: 25, display: 'flex', flexDirection: 'row' }}>
          <div style={{ width: 320 }}>
            <InfoCard
              title="Libraries"
              divider={false}
              headerStyle={{ paddingBottom: 0 }}
            >
              <div
                style={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ minWidth: 290, marginBottom: 15 }}>
                  <Select
                    onChange={value => setSelectedValue(String(value))}
                    label="Select the descriptor file"
                    selected={selectedValue}
                    items={selectItems}
                  />
                </div>

                <StructuredMetadataTable metadata={metadata} />
              </div>
            </InfoCard>
          </div>
          <div style={{ flexGrow: 1 }}>
            <LibraryCheckTable />
          </div>
        </div>
      </div>
    </CacheProvider>
  );
};

export default LibraryCheckRoot;
