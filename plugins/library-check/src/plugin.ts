import { libraryCheckApiRef, LibraryCheckApiClient } from './api/index';
import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const libraryCheckPlugin = createPlugin({
  id: 'library-check',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: libraryCheckApiRef,
      deps: { discoveryApi: discoveryApiRef, configApi: configApiRef },
      factory: ({ discoveryApi }) =>
        new LibraryCheckApiClient({ discoveryApi }),
    }),
  ],
});

export const LibraryCheckPage = libraryCheckPlugin.provide(
  createRoutableExtension({
    name: 'LibraryCheckPage',
    component: () => import('./components').then(m => m.LibraryCheckPage),
    mountPoint: rootRouteRef,
  }),
);

export const LibraryCheckIndexPage = libraryCheckPlugin.provide(
  createRoutableExtension({
    name: 'LibraryCheckIndexPage',
    component: () =>
      import('./components/LibraryCheckPluginPage').then(
        m => m.LibraryCheckPluginPage,
      ),
    mountPoint: rootRouteRef,
  }),
);
