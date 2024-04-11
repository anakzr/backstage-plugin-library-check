import axios from 'axios';
import { MavenResponseMapper } from '../mappers';
import { RegistryConfig } from '../mappers/RegistryMapper';

jest.mock('axios');

describe('MavenResponseMapper', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('map', () => {
    it('should map response correctly when no error', () => {
      const mapper = new MavenResponseMapper();
      const response = {
        response: {
          docs: [
            {
              a: 'artifactId',
              g: 'groupId',
              latestVersion: '1.0.0',
              timestamp: '2024-04-10T12:00:00Z',
              repositoryId: 'repoId',
              p: 'engines',
            },
          ],
        },
      };

      const library = mapper.map(response);

      expect(library.name).toBe('artifactId:groupId');
      expect(library.latest_version).toBe('1.0.0');
      expect(library.latest_version_date).toBe('2024-04-10T12:00:00.000Z');
    });

    it('should map response correctly when error is ERR_BAD_REQUEST', () => {
      const mapper = new MavenResponseMapper();
      const response = {
        code: 'ERR_BAD_REQUEST',
        dep: { name: 'libraryName' },
      };

      const library = mapper.map(response);

      expect(library.name).toBe('libraryName');
    });
  });

  describe('fetch', () => {
    it('should fetch data from the correct URL', async () => {
      const mapper = new MavenResponseMapper();
      const _registry = 'maven';
      const _library = 'mockito-core:org.mockito';
      const expectedUrl = `${RegistryConfig[_registry].url}?q=g:org.mockito+AND+a:mockito-core&rows=20&wt=json`;
      const responseData = { response: 'data' };
      const axiosGetMock = jest.spyOn(axios, 'get');
      axiosGetMock.mockResolvedValue({ data: responseData });

      const data = await mapper.fetch(_library, _registry);

      expect(axiosGetMock).toHaveBeenCalledWith(expectedUrl);
      expect(data).toEqual(responseData);
    });

    it('should return error object when request fails', async () => {
      const mapper = new MavenResponseMapper();
      const _registry = 'maven';
      const _library = 'org.jetbrains.kotlinkotlin-stdlib-jdk8';
      const axiosGetMock = jest.spyOn(axios, 'get');
      axiosGetMock.mockRejectedValue(new Error('Failed to fetch'));

      const data = await mapper.fetch(_library, _registry);

      expect(data.error).toBeDefined();
      expect(data.dep.name).toBe(_library);
    });
  });
});
