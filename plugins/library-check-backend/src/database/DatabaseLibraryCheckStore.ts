import {
  PluginDatabaseManager,
  resolvePackagePath,
} from '@backstage/backend-common';
import { Knex } from 'knex';
import {
  LibraryCheckStore,
  MaybeLibrary,
  MaybeLibraries,
} from './LibraryCheckStore';
import {
  Library,
  LibraryUpdateRecord,
  DistributionType,
  RecordsCountResponse,
  TLanguages,
} from '../types';

const migrationsDir = resolvePackagePath(
  '@anakz/backstage-plugin-library-check-backend',
  'migrations',
);

export class DatabaseLibraryCheckStore implements LibraryCheckStore {
  private constructor(private readonly db: Knex) {}

  static async create({
    database,
    skipMigrations,
  }: {
    database: PluginDatabaseManager;
    skipMigrations?: boolean;
  }): Promise<LibraryCheckStore> {
    const client = await database.getClient();

    if (!database.migrations?.skip && !skipMigrations) {
      await client.migrate.latest({
        directory: migrationsDir,
      });
    }

    return new DatabaseLibraryCheckStore(client);
  }

  async createLibrary(dep: Library): Promise<MaybeLibrary> {
    try {
      return await this.db.transaction(async trx => {
        await trx('libraries')
          .insert({
            name: dep.name,
            language: dep.language,
          })
          .onConflict(['name', 'language'])
          .ignore();

        const [library] = await trx('libraries').where({
          name: dep.name,
          language: dep.language,
        });

        return library || null;
      });
    } catch (error) {
      return null;
    }
  }

  async createLibraries(deps: Library[]): Promise<MaybeLibraries | null> {
    if (deps.length === 0) {
      return null;
    }

    try {
      await this.db.transaction(async trx => {
        await trx('libraries')
          .insert(deps)
          .onConflict(['name', 'language'])
          .ignore();
      });

      return deps;
    } catch (error) {
      return null;
    }
  }

  async readLibrary(name: string): Promise<MaybeLibrary> {
    try {
      const data = await this.db('libraries').where('name', '=', name);
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      return null;
    }
  }

  async listLibraries(): Promise<MaybeLibraries> {
    try {
      return await this.db.select('*').from('libraries');
    } catch (error) {
      return null;
    }
  }

  async readLibrariesByName(deps: string[]): Promise<MaybeLibraries> {
    try {
      return await this.db('libraries').whereIn('name', deps);
    } catch (error) {
      return null;
    }
  }

  async updateLibrary(dep: Library): Promise<MaybeLibrary> {
    try {
      return await this.db.transaction(async trx => {
        const updatedRowsCount = await trx('libraries')
          .where('name', '=', dep.name)
          .update({
            description: dep.description,
            created_at: dep.created_at,
            modified_at: dep.modified_at,
            homepage_url: dep.homepage_url,
            latest_version: dep.latest_version,
            latest_version_date: dep.latest_version_date,
            next_version: dep.next_version,
            repository: dep.repository,
            bugs_url: dep.bugs_url,
            engines: dep.engines,
            registry_last_check: dep.registry_last_check,
          });

        if (updatedRowsCount === 1) {
          return dep;
        }
        return null;
      });
    } catch (error) {
      return null;
    }
  }

  async deleteLibrary(name: string): Promise<boolean> {
    try {
      const result = await this.db('libraries')
        .where('name', '=', name)
        .delete();
      return !!result;
    } catch (error) {
      return false;
    }
  }

  async searchLibraries(query?: {
    language: TLanguages;
    registry_last_check: any;
  }): Promise<MaybeLibraries> {
    try {
      let rows: any = [];

      if (query?.registry_last_check) {
        rows = await this.db('libraries')
          .where('registry_last_check', '<=', query.registry_last_check)
          .orWhereNull('registry_last_check');
      }

      if (query?.language) {
        rows = await this.db('libraries').where(
          'language',
          '=',
          query.language,
        );
      }

      if (query?.language && query.registry_last_check) {
        rows = await this.db('libraries')
          .whereNull('registry_last_check')
          .andWhere('language', '=', query.language);
      }

      return rows;
    } catch (error) {
      return null;
    }
  }

  async createLibraryUpdateRecord(deps: LibraryUpdateRecord[]): Promise<any> {
    if (deps.length === 0) {
      return null;
    }

    try {
      await this.db.transaction(async trx => {
        await trx('entity_libraries_updates')
          .insert(deps)
          .onConflict([
            'library_name',
            'current_entity_version',
            'library_path',
          ])
          .merge({
            type_of_update: this.db.raw('EXCLUDED.type_of_update'),
            update_date: this.db.raw('EXCLUDED.update_date'),
            current_entity_version: this.db.raw(
              'EXCLUDED.current_entity_version',
            ),
            registry_version: this.db.raw('EXCLUDED.registry_version'),
            library_path: this.db.raw('EXCLUDED.library_path'),
          });
      });

      return deps;
    } catch (error) {
      return null;
    }
  }

  async readRecordsByNames(
    deps: string[],
  ): Promise<LibraryUpdateRecord[] | null> {
    const rows = await this.db('entity_libraries_updates').whereIn(
      'library_name',
      deps,
    );

    if (!rows) {
      return null;
    }

    return rows;
  }

  async searchRecordsByQuery(
    query?: any,
  ): Promise<LibraryUpdateRecord[] | null> {
    try {
      let rows: any = [];

      if (query?.type_of_update) {
        rows = await this.db('entity_libraries_updates').where(
          'type_of_update',
          '=',
          query.type_of_update,
        );
      }

      if (query?.library_name) {
        rows = await this.db('entity_libraries_updates').where(
          'library_name',
          '=',
          query.library_name,
        );
      }

      if (query?.entity_id) {
        rows = await this.db('entity_libraries_updates').where(
          'entity_id',
          '=',
          query.entity_id,
        );
      }

      if (query?.language) {
        rows = await this.db('entity_libraries_updates').where(
          'language',
          '=',
          query.language,
        );
      }

      return rows;
    } catch (error) {
      return null;
    }
  }

  async countTotalsByQuery(query?: any): Promise<RecordsCountResponse | null> {
    try {
      let response: any = null;

      if (query?.records) {
        response = await this.countTotals();
      }

      if (query?.entity) {
        response = await this.countTotalRecordsByEntity(query.entity);
      }

      if (query?.library) {
        response = await this.countTotalRecordsByLibrary(query.library);
      }

      if (query?.language) {
        response = await this.countTotalRecordsByLanguage(query.language);
      }

      return { total: response };
    } catch (error) {
      return null;
    }
  }

  async countTotalRecordsByLibrary(dep: string): Promise<number | null> {
    try {
      const rows = await this.db('entity_libraries_updates').where(
        'library_name',
        '=',
        dep,
      );
      return rows ? rows.length : 0;
    } catch (error) {
      return null;
    }
  }

  async countTotalRecordsByEntity(entity: string): Promise<number | null> {
    try {
      const rows = await this.db('entity_libraries_updates').where(
        'entity_id',
        '=',
        entity,
      );
      return rows ? rows.length : 0;
    } catch (error) {
      return null;
    }
  }

  async countTotalRecordsByLanguage(language: string): Promise<number | null> {
    try {
      const rows = await this.db('entity_libraries_updates').where(
        'language',
        '=',
        language,
      );
      return rows ? rows.length : 0;
    } catch (error) {
      return null;
    }
  }

  async countTotals(): Promise<number | null> {
    try {
      const result = await this.db.raw(
        `SELECT DISTINCT library_name, language FROM entity_libraries_updates`,
      );
      return result.rows ? result.rows.length : 0;
    } catch (error) {
      return null;
    }
  }

  async getImpactDistributionByQuery(
    query?: any,
  ): Promise<DistributionType[] | null> {
    try {
      let totals: DistributionType[] | null = null;

      if (query?.library) {
        totals = await this.getImpactDistributionByLibraries();
      } else if (query?.entity) {
        totals = await this.getImpactDistributionByEntities();
      } else if (
        query?.language !== 'all' &&
        query?.language !== null &&
        query?.language !== undefined
      ) {
        const result = await this.getImpactDistributionByLibraries();
        const selectedLanguage = query.language;

        const filteredItems = result?.filter(
          item => item.language === selectedLanguage,
        );

        totals = filteredItems ?? null;
      } else if (query?.language === 'all') {
        totals = await this.getImpactDistributionByLanguages();
      }

      return totals;
    } catch (error) {
      return null;
    }
  }

  async getImpactDistributionByLibraries(): Promise<DistributionType[] | null> {
    try {
      const distribution = await this.db.raw(`
        SELECT
          language,
          library_name AS item,
          COALESCE(SUM(CASE WHEN type_of_update = 'breaking' THEN 1 ELSE 0 END), 0) AS breaking,
          COALESCE(SUM(CASE WHEN type_of_update = 'minor' THEN 1 ELSE 0 END), 0) AS minor,
          COALESCE(SUM(CASE WHEN type_of_update = 'patch' THEN 1 ELSE 0 END), 0) AS patch,
          COALESCE(SUM(CASE WHEN type_of_update = 'unknown' THEN 1 ELSE 0 END), 0) AS unknown
        FROM
          entity_libraries_updates
        GROUP BY
          language,
          library_name
        ORDER BY library_name ASC
      `);

      return distribution.rows;
    } catch (error) {
      return null;
    }
  }

  async getImpactDistributionByEntities(): Promise<DistributionType[] | null> {
    try {
      const distribution = await this.db.raw(`
        SELECT
          entity_id AS item,
          COALESCE(SUM(CASE WHEN type_of_update = 'breaking' THEN 1 ELSE 0 END), 0) AS breaking,
          COALESCE(SUM(CASE WHEN type_of_update = 'minor' THEN 1 ELSE 0 END), 0) AS minor,
          COALESCE(SUM(CASE WHEN type_of_update = 'patch' THEN 1 ELSE 0 END), 0) AS patch,
          COALESCE(SUM(CASE WHEN type_of_update = 'unknown' THEN 1 ELSE 0 END), 0) AS unknown
        FROM
          entity_libraries_updates
        GROUP BY
          entity_id
        ORDER BY entity_id ASC
      `);

      return distribution.rows;
    } catch (error) {
      return null;
    }
  }

  async getImpactDistributionByLanguages(): Promise<DistributionType[] | null> {
    try {
      const distribution = await this.db.raw(`
        SELECT
          language AS item,
          COALESCE(SUM(CASE WHEN type_of_update = 'breaking' THEN 1 ELSE 0 END), 0) AS breaking,
          COALESCE(SUM(CASE WHEN type_of_update = 'minor' THEN 1 ELSE 0 END), 0) AS minor,
          COALESCE(SUM(CASE WHEN type_of_update = 'patch' THEN 1 ELSE 0 END), 0) AS patch,
          COALESCE(SUM(CASE WHEN type_of_update = 'unknown' THEN 1 ELSE 0 END), 0) AS unknown
        FROM
          entity_libraries_updates
        GROUP BY
          language
        ORDER BY breaking DESC
      `);

      return distribution.rows;
    } catch (error) {
      return null;
    }
  }

  async getDistinctLibrariesPerLanguage(): Promise<
    [{ language: string; total: string }] | null
  > {
    try {
      const result = await this.db.raw(`SELECT
        language,
        COUNT(DISTINCT library_name) AS total
      FROM
        entity_libraries_updates
      GROUP BY
        language`);

      return result.rows;
    } catch (error) {
      return null;
    }
  }

  async getDistinctImpactByEntity(): Promise<
    [{ entity_id: string; type_of_update: string; total: string }] | null
  > {
    try {
      const result = await this.db.raw(`SELECT
      entity_id,
      type_of_update,
      COUNT(DISTINCT library_name) AS total
    FROM
      entity_libraries_updates
    GROUP BY
      entity_id,
      type_of_update
    ORDER BY total DESC`);

      return result.rows;
    } catch (error) {
      return null;
    }
  }

  async getLanguages(): Promise<[{ language: string }] | null> {
    try {
      const result = await this.db.raw(
        `SELECT DISTINCT language FROM entity_libraries_updates`,
      );
      return result.rows;
    } catch (error) {
      return null;
    }
  }
}
