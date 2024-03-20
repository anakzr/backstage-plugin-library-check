// CacheContext.tsx

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';

interface CacheContextProps {
  cache: Record<string, any>;
  updateCache: Dispatch<SetStateAction<Record<string, any>>>;
}

const CacheContext = createContext<CacheContextProps | undefined>(undefined);

export const CacheProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cache, setCache] = useState<Record<string, any>>({});

  const updateCache: Dispatch<SetStateAction<Record<string, any>>> = arg => {
    setCache(prevCache => ({
      ...prevCache,
      ...(typeof arg === 'function' ? arg(prevCache) : arg),
    }));
  };

  const contextValue: CacheContextProps = { cache, updateCache };

  return (
    <CacheContext.Provider value={contextValue}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = (): CacheContextProps => {
  const contextValue = useContext(CacheContext);

  if (!contextValue) {
    throw new Error('useCache must be used within a CacheProvider');
  }

  return contextValue;
};
