// useLibrarySearch.ts

import { useEffect, useState } from 'react';
import { Octokit } from '@octokit/rest';
import { useCache } from '../context/CacheContext';
import {
  githubAuthApiRef,
  useApi,
  configApiRef,
} from '@backstage/core-plugin-api';

export interface LibrarySearchResult {
  libraryName: string;
  repoName: string;
  data: any;
}

export const useLibrarySearch = (): {
  searchResult: LibrarySearchResult | null;
  isDialogOpen: boolean;
  openDialog: (libraryName: string, repoName: string) => void;
  closeDialog: () => void;
  isGithubAvailable: boolean;
  searchError: boolean;
  fetchCodeContent: (contentsUrl: string, searchItem: any) => Promise<any>;
} => {
  const { cache, updateCache } = useCache();
  const [isGithubAvailable, setIsGithubAvailable] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const githubApi = useApi(githubAuthApiRef);
  const configApi = useApi(configApiRef);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const currentIntegrations = configApi.getConfig('integrations');
      const githubIntegration =
        // TODO: map different providers
        currentIntegrations?.getConfigArray('github') || false;

      if (githubIntegration) {
        setIsGithubAvailable(true);
      }
    } catch (error) {
      setIsGithubAvailable(false);
    }
  }, [configApi]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const accessToken = await githubApi.getAccessToken([
          'repo',
          'read:org',
        ]);
        setToken(accessToken);
      } catch (error) {
        setSearchError(true);
      }
    };

    fetchToken();
  }, [githubApi]);

  const octokit = new Octokit({
    auth: token,
  });

  const [searchResult, setSearchResult] = useState<LibrarySearchResult | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchData = async (libraryName: string, repoName: string) => {
    if (cache[libraryName]) {
      setSearchResult(cache[libraryName]);
    } else {
      try {
        const response = await octokit.search.code({
          q: `${libraryName} repo:${repoName}`,
        });

        const result: LibrarySearchResult = {
          libraryName,
          repoName,
          data: response,
        };

        updateCache((prevCache: Record<string, any>) => ({
          ...prevCache,
          [libraryName]: result,
        }));

        setSearchResult(result);
      } catch (error) {
        setSearchError(true);
      }
    }
  };

  const fetchCodeContent = async (contentsUrl: string, searchItem: any) => {
    try {
      const url = contentsUrl.replace('{+path}', `${searchItem.path}`);
      const response = await octokit.request(`GET ${url}`);

      if (response.data.content) {
        // Decode and display the content
        return response.data;
      }
    } catch (error) {
      setSearchError(true);
      return null;
    }
  };

  const openDialog = (libraryName: string, repoName: string) => {
    fetchData(libraryName, repoName);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSearchResult(null);
  };

  return {
    searchResult,
    isDialogOpen,
    openDialog,
    closeDialog,
    fetchCodeContent,
    isGithubAvailable,
    searchError,
  };
};
