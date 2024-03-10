# Frontend

Add the plugin to your frontend app:

```bash
cd packages/app && yarn add @anakz/backstage-plugin-library-check
```

Expose the main plugin page:

```ts
// packages/app/src/App.tsx

import { LibraryCheckIndexPage } from '@anakz/backstage-plugin-library-check';

// ...

const AppRoutes = () => (
  <FlatRoutes>
    // ...
    <Route path="/library-check" element={<LibraryCheckIndexPage />} />
    // ...
  </FlatRoutes>
);
```


Add it to sidebar:

```ts
 // packages/app/src/components/Root/Root.tsx

 // ...
 
 <SidebarItem
   icon={ExtensionIcon}
   to="library-check"
   text="Libraries"
 />

 // ...
```

Expose the entity plugin tab:

```ts
// packages/app/src/components/catalog/EntityPage.tsx

import {
  LibraryCheckPage,
  useIsProjectLibrariesAvailable,
} from '@anakz/backstage-plugin-library-check';

// ...

const serviceEntityPage = (
// ...

    <EntityLayout.Route
      path="/library-check"
      title="Libraries"
      if={useIsProjectLibrariesAvailable}
    >
      <LibraryCheckPage />
    </EntityLayout.Route>

// ...    
)

```

The plugin interface now available if any supported project descriptor file is present. 

