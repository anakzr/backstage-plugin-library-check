// LibrarySearchDialog.tsx

import React from 'react';
import { Divider, Drawer, Typography } from '@material-ui/core';
import LibraryCodeContent from './LibraryCodeContent';
import { Progress } from '@backstage/core-components';
import { Alert } from '@material-ui/lab';

export interface LibrarySearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  libraryName: string;
  searchResult: any;
  searchError: boolean;
}

export const LibrarySearchDialog: React.FC<LibrarySearchDialogProps> = ({
  isOpen,
  onClose,
  libraryName,
  searchResult,
  searchError,
}) => {
  return (
    <div style={{ width: 600 }}>
      {searchError && (
        <Alert severity="error" style={{ marginBottom: 20 }}>
          We had a problem fetching code.
        </Alert>
      )}

      <Drawer
        open={isOpen}
        onClose={onClose}
        anchor="right"
        style={{ width: 600 }}
        PaperProps={{
          style: { width: 640 },
        }}
      >
        <Typography
          variant="h6"
          style={{ marginBottom: 10, padding: '10px 15px' }}
        >
          {searchResult ? `Occurrences for '${libraryName}' ` : 'Loading..'}
        </Typography>

        <Divider />
        {searchResult ? (
          <div
            style={{
              overflowY: 'auto',
              height: 'calc(100% - 70px)',
              padding: '0px 15px',
            }}
          >
            <Typography variant="h6" style={{ margin: '10px 0' }}>
              {`Files (${searchResult.data.total_count}):`}
            </Typography>
            {searchResult ? (
              <div>
                {searchResult.data.items.map((item: any, index: any) => (
                  <LibraryCodeContent searchItem={item} key={index} />
                ))}
              </div>
            ) : (
              <p>No results found.</p>
            )}
          </div>
        ) : (
          <Progress />
        )}
      </Drawer>
    </div>
  );
};
