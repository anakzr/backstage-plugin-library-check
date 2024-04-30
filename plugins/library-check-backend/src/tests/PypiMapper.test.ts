import axios from 'axios';
import { PypiResponseMapper } from '../mappers';
import { RegistryConfig } from '../mappers/RegistryMapper';

jest.mock('axios');

describe('PypiResponseMapper', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('map', () => {
    it('should map response correctly when no error', () => {
      const mapper = new PypiResponseMapper();
      const response = {
        info: {
          name: 'packagename',
          description: 'Package description',
          version: '1.0.0',
          home_page: 'https://example.com',
          project_urls: { Homepage: 'https://example.com' },
          bugtrack_url: 'https://example.com/bugs',
          requires_python: '>=3.6',
        },
      };

      const library = mapper.map(response);

      expect(library.name).toBe('packagename');
      expect(library.description).toBe('Package description');
      expect(library.latest_version).toBe('1.0.0');
      expect(library.homepage_url).toBe('https://example.com');
      expect(library.repository).toBe('https://example.com');
      expect(library.bugs_url).toBe('https://example.com/bugs');
      expect(library.engines).toBe('>=3.6');
      expect(library.language).toBe('python');
    });

    it('should map response correctly when error is ERR_BAD_REQUEST', () => {
      const mapper = new PypiResponseMapper();
      const response = {
        code: 'ERR_BAD_REQUEST',
        dep: { name: 'packagename' },
      };

      const library = mapper.map(response);

      expect(library.name).toBe('packagename');
      expect(library.language).toBe('python');
    });
  });

  describe('fetch', () => {
    it('should fetch data from the correct URL', async () => {
      const mapper = new PypiResponseMapper();
      const _registry = 'pypi';
      const _library = 'packagename';
      const expectedUrl = `${RegistryConfig[_registry].url}/pypi/${_library}/json`;
      const responseData = { info: 'data' };
      const axiosGetMock = jest.spyOn(axios, 'get');
      axiosGetMock.mockResolvedValue({ data: responseData });

      const data = await mapper.fetch(_library, _registry);

      expect(axiosGetMock).toHaveBeenCalledWith(expectedUrl);
      expect(data).toEqual(responseData);
    });

    it('should return error object when request fails', async () => {
      const mapper = new PypiResponseMapper();
      const _registry = 'pypi';
      const _library = 'packagename';
      const axiosGetMock = jest.spyOn(axios, 'get');
      axiosGetMock.mockRejectedValue(new Error('Failed to fetch'));

      const data = await mapper.fetch(_library, _registry);

      expect(data.error).toBeDefined();
      expect(data.dep.name).toBe(_library);
    });
  });
});
