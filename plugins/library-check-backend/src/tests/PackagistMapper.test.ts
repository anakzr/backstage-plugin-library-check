import axios from 'axios';
import { PackagistResponseMapper } from '../mappers';
import { RegistryConfig } from '../mappers/RegistryMapper';

jest.mock('axios');

describe('PackagistResponseMapper', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('map', () => {
    it('should map response correctly when no error', () => {
      const mapper = new PackagistResponseMapper();
      const response = {
        packages: {
          packageName: [
            {
              description: 'Package description',
              version: '1.0.0',
              time: '2024-04-10T12:00:00Z',
              homepage: 'https://example.com',
              source: { url: 'https://github.com/example/packageName' },
              support: {
                issues: 'https://github.com/example/packageName/issues',
              },
              require: { php: '>=7.0' },
            },
          ],
        },
      };

      const library = mapper.map(response);

      expect(library.name).toBe('packageName');
      expect(library.description).toBe('Package description');
      expect(library.latest_version).toBe('1.0.0');
      expect(library.latest_version_date).toBe('2024-04-10T12:00:00Z');
      expect(library.created_at).toBe('2024-04-10T12:00:00Z');
      expect(library.modified_at).toBe('2024-04-10T12:00:00Z');
      expect(library.homepage_url).toBe('https://example.com');
      expect(library.repository).toBe(
        '+git:https://github.com/example/packageName',
      );
      expect(library.bugs_url).toBe(
        'https://github.com/example/packageName/issues',
      );
      expect(library.engines).toBe('>=7.0');
      expect(library.language).toBe('php');
    });

    it('should map response correctly when error is ERR_BAD_REQUEST', () => {
      const mapper = new PackagistResponseMapper();
      const response = {
        code: 'ERR_BAD_REQUEST',
        dep: { name: 'packageName' },
      };

      const library = mapper.map(response);

      expect(library.name).toBe('packageName');
      expect(library.language).toBe('php');
    });
  });

  describe('fetch', () => {
    it('should fetch data from the correct URL', async () => {
      const mapper = new PackagistResponseMapper();
      const _registry = 'packagist';
      const _library = 'packageName';
      const url = RegistryConfig[_registry].url;
      const expectedUrl = `${url}/p2/${_library}.json`;
      const responseData = { packages: { packageName: [] } };
      const axiosGetMock = jest.spyOn(axios, 'get');
      axiosGetMock.mockResolvedValue({ data: responseData });

      await mapper.fetch(_library, _registry);

      expect(axiosGetMock).toHaveBeenCalledWith(expectedUrl);
    });
  });
});
