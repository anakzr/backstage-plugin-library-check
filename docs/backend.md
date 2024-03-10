
# Backend Setup

Add the plugin to your backend app:

```bash
cd packages/backend && yarn add @anakz/backstage-plugin-dependency-check-backend
```

Create new file at packages/backend/src/plugins/dependencyCheck.ts:

```ts

// packages/backend/src/plugins/dependencyCheck.ts

import { PluginEnvironment } from '../types';
import { Router } from 'express';
import {
  DatabaseDependencyCheckStore,
  createRouter,
} from '@anakz/backstage-plugin-dependency-check-backend';

export default async function createPlugin({
  logger,
  database,
  config,
}: PluginEnvironment): Promise<Router> {
  const db = await DatabaseDependencyCheckStore.create({
    database: database,
  });
  return await createRouter({
    logger,
    database: db,
    config,
  });
}
```

Define the schedules for the plugin processor and provider on packages/backend/src/plugins/catalog.ts

```ts

// packages/backend/src/plugins/catalog.ts

// ...
builder.addEntityProvider(

    // add a new provider entry, configure the schedule frequency as you wish
    // initialDelay must be up to 15s to avoid conflicts

    DependencyCheckProvider.fromConfig({
      config: env.config,
      envId: 'production',
      logger: env.logger,
      discovery: env.discovery,
      schedule: env.scheduler.createScheduledTaskRunner({
        initialDelay: {
          seconds: 15,
        },
        frequency: {
          minutes: 60,
        },
        timeout: {
          minutes: 1,
        },
      }),
    }),

    // ...
)

// add the new processors entries

  builder.addProcessor(
    // ...

    DependencyCheckProcessor.fromConfig(env.config, {
      reader: env.reader,
      logger: env.logger,
    }),
    DependencyCheckGlobalUpdateProcessor.fromConfig(env.config, {
      reader: env.reader,
      logger: env.logger,
    }),

    // ...
  );


```

Now add the plugin to your packages/backend/src/index.ts:

```ts
import dependencyCheck from './plugins/dependencyCheck';

// ...
const dependencyCheckEnv = useHotMemoize(module, () => createEnv('dependencyCheck'));

// ...
  apiRouter.use('/dependency-check', await dependencyCheck(dependencyCheckEnv));
```