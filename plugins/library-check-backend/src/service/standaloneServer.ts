import Knex from 'knex';
import { DatabaseLibraryCheckStore } from '../database/index';
import {
  createServiceBuilder,
  loadBackendConfig,
  useHotMemoize,
} from '@backstage/backend-common';
import { Server } from 'http';
import { Logger } from 'winston';
import { createRouter } from './router';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: Logger;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({
    service: 'library-check',
  });

  const config = await loadBackendConfig({ logger, argv: process.argv });

  const database = useHotMemoize(module, () => {
    return Knex(config.get('backend.database'));
  });

  const db = await DatabaseLibraryCheckStore.create({
    database: { getClient: async () => database },
  });

  logger.debug('Starting application server...');

  const router = await createRouter({
    logger,
    database: db,
    config,
  });

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/library-check', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
