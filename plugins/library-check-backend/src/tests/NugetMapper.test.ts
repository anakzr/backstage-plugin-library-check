import axios from 'axios';
import { NugetResponseMapper } from '../mappers';
import { RegistryConfig } from '../mappers/RegistryMapper';

jest.mock('axios');

describe('NugetResponseMapper', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('map', () => {
    it('should map response correctly', () => {
      const mapper = new NugetResponseMapper();
      const response = {
        id: 'packageName',
        description: 'Package description',
        version: '1.0.0',
        lastEdited: '2024-04-10T12:00:00Z',
        created: '2024-04-09T12:00:00Z',
        '@id': 'https://example.com',
        repository: 'https://example.com/repository',
        projectUrl: 'https://example.com/bugs',
        tags: ['tag1', 'tag2'],
      };

      const library = mapper.map(response);

      expect(library.name).toBe('packageName');
      expect(library.description).toBe('Package description');
      expect(library.latest_version).toBe('1.0.0');
      expect(library.latest_version_date).toBe('2024-04-10T12:00:00Z');
      expect(library.created_at).toBe('2024-04-09T12:00:00Z');
      expect(library.modified_at).toBe('2024-04-10T12:00:00Z');
      expect(library.homepage_url).toBe('https://example.com');
      expect(library.repository).toBe('https://example.com/repository');
      expect(library.bugs_url).toBe('https://example.com/bugs');
      expect(library.engines).toBe('tag1,tag2');
      expect(library.language).toBe('csharp');
      // Add more assertions for other properties as needed
    });
  });

  describe('fetch', () => {
    it('should fetch data from the correct URL', async () => {
      const mapper = new NugetResponseMapper();
      const _registry = 'nuget';
      const _library = 'packageName';
      const url = RegistryConfig[_registry].url;
      const expectedUrl = `${url}/${_library.toLowerCase()}/index.json`;
      const responseData = {
        count: 1,
        items: [
          {
            count: 1,
            items: [
              {
                catalogEntry: {
                  '@id': 'https://example.com/packageMetadataUrl',
                },
              },
            ],
          },
        ],
      };
      const axiosGetMock = jest.spyOn(axios, 'get');
      axiosGetMock.mockResolvedValue({ data: responseData });

      await mapper.fetch(_library, _registry);

      expect(axiosGetMock).toHaveBeenCalledWith(expectedUrl);
    });
  });
});
