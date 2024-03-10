# Frontend

Add the plugin to your frontend app:

```bash
cd packages/app && yarn add @anakz/backstage-plugin-dependency-check
```

Expose the main plugin page:

```ts
// packages/app/src/App.tsx

import { DependencyCheckIndexPage } from '@anakz/backstage-plugin-dependency-check';

// ...

const AppRoutes = () => (
  <FlatRoutes>
    // ...
    <Route path="/dependency-check" element={<DependencyCheckIndexPage />} />
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
   to="dependency-check"
   text="Libraries"
 />

 // ...
```

Expose the entity plugin tab:

```ts
// packages/app/src/components/catalog/EntityPage.tsx

import {
  DependencyCheckPage,
  useIsProjectDependenciesAvailable,
} from '@anakz/backstage-plugin-dependency-check';

// ...

const serviceEntityPage = (
// ...

    <EntityLayout.Route
      path="/dependency-check"
      title="Libraries"
      if={useIsProjectDependenciesAvailable}
    >
      <DependencyCheckPage />
    </EntityLayout.Route>

// ...    
)

```

The plugin interface now available if any supported project descriptor file is present. 

