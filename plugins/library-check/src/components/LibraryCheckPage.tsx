import React from 'react';
import { LibraryCheckProvider } from '../context/LibraryCheckContext';
import LibraryCheckRoot from './LibraryCheckRoot';

export const LibraryCheckPage = () => {
  return (
    <LibraryCheckProvider>
      <LibraryCheckRoot />
    </LibraryCheckProvider>
  );
};

export default LibraryCheckRoot;
