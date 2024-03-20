import { Knex } from 'knex';
import { DatabaseLibraryCheckStore } from '../database/DatabaseLibraryCheckStore';
import { TestDatabaseId, TestDatabases } from '@backstage/backend-test-utils';
import { Library, LibraryUpdateRecord } from '../types';

jest.setTimeout(60_000);

const databases = TestDatabases.create({
  ids: ['POSTGRES_13'],
  disableDocker: !process.env.GITHUB_ACTIONS,
});

async function createStore(databaseId: TestDatabaseId) {
  const knex = await databases.init(databaseId);
  const databaseManager = {
    getClient: async () => knex,
    migrations: {
      skip: false,
    },
  };

  return {
    knex,
    storage: await DatabaseLibraryCheckStore.create({
      database: databaseManager,
    }),
  };
}

type InsertLibrary = Partial<Library>;
type InsertLibraryRecord = Partial<LibraryUpdateRecord>;

const library: InsertLibrary = {
  name: 'library-1',
  language: 'javascript',
};

const libraryRecords: InsertLibraryRecord = {
  library_name: 'library-1',
  entity_id: 'entity-test-1',
  library_path: 'src/package.json',
};

describe.each(databases.eachSupportedId())(
  'DatabaseLibraryCheckStore',
  databaseId => {
    let storage: DatabaseLibraryCheckStore;
    let knex: Knex;

    const insertLibrary = async (data: InsertLibrary) =>
      (await knex<InsertLibrary>('libraries').insert(data).returning('id'))[0]
        .id ?? -1;

    const insertLibraryRecord = async (data: InsertLibraryRecord) =>
      (
        await knex<InsertLibraryRecord>('entity_libraries_updates')
          .insert(data)
          .returning('id')
      )[0]?.id ?? -1;

    beforeAll(async () => {
      // @ts-ignore
      ({ storage, knex } = await createStore(databaseId));
    });

    afterEach(async () => {
      jest.resetAllMocks();

      await knex('libraries').del();
      await knex('entity_libraries_updates').del();
    });

    describe('insert and fetch library and entity library record on database', () => {
      it('should fetch library', async () => {
        await insertLibrary(library);
        const returned = await storage.readLibrary('library-1');

        expect(returned).toBeDefined();
        expect(returned?.name).toEqual('library-1');
      });

      it('should fetch library record', async () => {
        await insertLibraryRecord(libraryRecords);
        const returned = await storage.readRecordsByNames(['library-1']);

        expect(returned).toBeDefined();
        expect(returned?.[0]?.library_name).toEqual('library-1');
      });
    });

    describe('update a library with registry data on database - if it exists', () => {
      it('should update library', async () => {
        await insertLibrary(library);

        const returned = await storage.updateLibrary({
          name: 'library-1',
          description: 'test description',
          language: 'javascript',
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
          homepage_url: 'http://test.com',
          latest_version: '1.1.1',
          latest_version_date: new Date().toISOString(),
          next_version: '2.0.0',
          repository: 'http://test.com',
          bugs_url: 'http://test.com',
          engines: 'node',
          registry_last_check: new Date().toISOString(),
        });

        expect(returned).toBeDefined();
        expect(returned?.name).toEqual('library-1');
        expect(returned?.language).toEqual('javascript');
        expect(returned?.description).toEqual('test description');
        expect(returned?.homepage_url).toEqual('http://test.com');
        expect(returned?.repository).toEqual('http://test.com');
        expect(returned?.bugs_url).toEqual('http://test.com');
        expect(returned?.latest_version).toEqual('1.1.1');
        expect(returned?.created_at).toBeDefined();
        expect(returned?.modified_at).toBeDefined();
        expect(returned?.registry_last_check).toBeDefined();
        expect(returned?.latest_version_date).toBeDefined();
      });
    });
  },
);
