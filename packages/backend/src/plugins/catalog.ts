import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { Router } from 'express';
import {
  GithubEntityProvider,
  GithubOrgEntityProvider,
} from '@backstage/plugin-catalog-backend-module-github';

import { PluginEnvironment } from '../types';
import {
  LibraryCheckUpdaterProcessor,
  LibraryCheckProcessor,
  LibraryCheckProvider,
} from '@anakz/backstage-plugin-library-check-backend';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = CatalogBuilder.create(env);

  builder.addEntityProvider(
    GithubEntityProvider.fromConfig(env.config, {
      logger: env.logger,
      schedule: env.scheduler.createScheduledTaskRunner({
        frequency: {
          minutes: env.config
            .getConfig('updateCatalog')
            .getNumber('frequencyGithubEntityProvider'),
        },
        timeout: {
          minutes: env.config
            .getConfig('updateCatalog')
            .getNumber('timeoutGithubEntityProvider'),
        },
      }),
    }),

    GithubOrgEntityProvider.fromConfig(env.config, {
      id: 'production',
      orgUrl: `https://github.com/${env.config
        .getConfig('organization')
        .getString('name')}`,
      logger: env.logger,
      schedule: env.scheduler.createScheduledTaskRunner({
        frequency: {
          minutes: env.config
            .getConfig('updateCatalog')
            .getNumber('frequencyGithubOrgEntityProvider'),
        },
        timeout: {
          minutes: env.config
            .getConfig('updateCatalog')
            .getNumber('timeoutGithubOrgEntityProvider'),
        },
      }),
    }),

    LibraryCheckProvider.fromConfig({
      config: env.config,
      envId: 'production',
      logger: env.logger,
      discovery: env.discovery,
      schedule: env.scheduler.createScheduledTaskRunner({
        initialDelay: {
          seconds: 190,
        },
        frequency: {
          minutes: 60,
        },
        timeout: {
          minutes: 3,
        },
      }),
    }),
  );

  builder.addProcessor(
    LibraryCheckProcessor.fromConfig(env.config, {
      reader: env.reader,
      logger: env.logger,
    }),

    LibraryCheckUpdaterProcessor.fromConfig(env.config, {
      reader: env.reader,
      logger: env.logger,
    }),
  );

  builder.setProcessingIntervalSeconds(
    env.config.getConfig('updateCatalog').getNumber('updateInterval'),
  );

  const { processingEngine, router } = await builder.build();

  await processingEngine.start();

  return router;
}
