import { PluginEnvironment } from '../types';
import { Router } from 'express';
import {
  DatabaseLibraryCheckStore,
  createRouter,
} from '@anakz/backstage-plugin-library-check-backend';

export default async function createPlugin({
  logger,
  database,
  config,
}: PluginEnvironment): Promise<Router> {
  const db = await DatabaseLibraryCheckStore.create({
    database: database,
  });
  return await createRouter({
    logger,
    database: db,
    config,
  });
}
