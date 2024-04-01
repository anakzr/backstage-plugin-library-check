import { LibraryCheckStore } from '../database/index';
import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import express, { RequestHandler } from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { LibraryUpdateRecord, Library } from '../types';
import { InputError } from '@backstage/errors';

export interface RouterOptions {
  logger: Logger;
  config: Config;
  database: LibraryCheckStore;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, database } = options;

  const router = Router();
  router.use(express.json());
  router.use(
    express.urlencoded({
      extended: true,
    }),
  );

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  // TODO: Validate all body params with AJV library or similar

  // GET: /health | displayCheck()

  // GET: /libraries | getDeps()

  // GET: /libraries/:id | getDepsById()

  // POST: /libraries | createDep()

  // PUT: /libraries/:id | updateDep()

  // DELETE: /libraries/:id | deleteDep()

  // POST: /libraries/search? | searchDep()
  // Ex:                /search?language=javascript&registry_last_check=null

  /**
   * List ALL Libraries on the database
   */
  router.get(`/libraries`, (async (_, response) => {
    const data = await database.listLibraries();

    if (!data) {
      throw new InputError(`There was an error trying to get libraries data`);
    }
    response.status(200);
    response.json(data);
  }) as RequestHandler);

  /**
   * Get SINGLE
   */
  router.get(`/libraries/id/:name`, (async (request, response) => {
    const data = await database.readLibrary(request.params.name);

    response.status(200);
    response.json(data ?? []);
  }) as RequestHandler);

  /**
   * CREATE ONE/MANY
   */
  router.post(`/libraries`, (async (request, response) => {
    const payload: Library[] = request.body;
    const data = await database.createLibraries(payload);

    if (!data) {
      throw new InputError(
        `There was an error trying persist libraries on database`,
      );
    }

    response.status(200);
    response.json(data);
  }) as RequestHandler);

  /**
   * UPDATE ONE/MANY
   *
   */
  router.put(`/libraries/update`, (async (request, response) => {
    const payload: Library = request.body;
    const data = await database.updateLibrary(payload);

    if (!data) {
      throw new InputError(`There was an error trying to update the libraries`);
    }

    response.status(200);
    response.json(data);
  }) as RequestHandler);

  /**
   * DELETE SINGLE
   */
  router.delete(`/libraries/:name`, (async (request, response) => {
    const data = await database.deleteLibrary(request.params.name);

    if (!data) {
      throw new InputError(`There was an error trying to delete the library`);
    }

    response.status(200);
    response.json(data);
  }) as RequestHandler);

  /**
   * Search by query
   *
   */
  router.get(`/libraries/search`, (async (request, response) => {
    const query: {} = request.query;
    const data = await database.searchLibraries(query);

    if (!data) {
      throw new InputError(`Libraries searched does not exist on database`);
    }

    response.status(200);
    response.json(data);
  }) as RequestHandler);

  /**
   * SEARCH
   */

  router.post(`/libraries/search`, (async (request, response) => {
    const payload: string[] = request.body;
    const data = await database.readLibrariesByName(payload);

    if (!data) {
      throw new InputError(`Libraries searched does not exist on database`);
    }

    response.status(200);
    response.json(data);
  }) as RequestHandler);

  /**
   *
   *
   * entity_libraries_updates query ROUTES
   *
   *
   */
  router.post(`/libraries-updates`, (async (request, response) => {
    const payload: LibraryUpdateRecord[] = request.body;
    const data = await database.createLibraryUpdateRecord(payload);

    if (!data) {
      throw new InputError(`There was an error trying to create a new record`);
    }

    response.status(200);
    response.json(data);
  }) as RequestHandler);

  /**
   * Search MULTIPLE records by names []string
   */
  router.post(`/libraries-updates/search`, (async (request, response) => {
    const payload: string[] = request.body;
    const data = await database.readRecordsByNames(payload);

    if (!data) {
      throw new InputError(`Records searched does not exist on database`);
    }

    response.status(200);
    response.json(data);
  }) as RequestHandler);

  /**
   * Search record updates by query params
   *
   */
  router.get(`/libraries-updates/search`, (async (request, response) => {
    const query: {} = request.query;
    const data = await database.searchRecordsByQuery(query);

    if (!data) {
      throw new InputError(`Records searched does not exist on database`);
    }

    response.status(200);
    response.json(data);
  }) as RequestHandler);

  /**
   * Distribution Impact record updates by query params
   *
   */
  router.get(`/libraries-updates/distribution`, (async (request, response) => {
    const query: {} = request.query;
    const data = await database.getImpactDistributionByQuery(query);

    if (!data) {
      throw new InputError(`Distribution records does not exist on database`);
    }

    response.status(200);
    response.json(data);
  }) as RequestHandler);

  /**
   * Count record updates by query params
   *
   */

  router.get(`/libraries-updates/count`, (async (request, response) => {
    const query: {} = request.query;
    const data = await database.countTotalsByQuery(query);

    if (!data) {
      throw new InputError(`No records were found on database`);
    }

    response.status(200).json({ total: data });
  }) as RequestHandler);

  router.get(`/libraries-updates/languages/totals`, (async (_, response) => {
    const data = await database.getDistinctLibrariesPerLanguage();

    if (!data) {
      throw new InputError(`No languages were found on database`);
    }

    response.status(200).json(data);
  }) as RequestHandler);

  router.get(`/libraries/languages`, (async (_, response) => {
    const data = await database.getLanguages();

    if (!data) {
      throw new InputError(`No languages were found on database`);
    }

    response.status(200).json(data);
  }) as RequestHandler);

  router.get(`/libraries-updates/updates/entities`, (async (_, response) => {
    const data = await database.getDistinctImpactByEntity();

    if (!data) {
      throw new InputError(`No entities were found on database`);
    }

    response.status(200).json(data);
  }) as RequestHandler);

  router.use(errorHandler());
  return router;
}
