import {
  createRouter,
  providers,
  defaultAuthProviderFactories,
} from '@backstage/plugin-auth-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
// import {
//   stringifyEntityRef,
//   DEFAULT_NAMESPACE,
// } from '@backstage/catalog-model';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
    database: env.database,
    discovery: env.discovery,
    tokenManager: env.tokenManager,
    providerFactories: {
      ...defaultAuthProviderFactories,

      // This replaces the default GitHub auth provider with a customized one.
      // The `signIn` option enables sign-in for this provider, using the
      // identity resolution logic that's provided in the `resolver` callback.
      //
      // This particular resolver makes all users share a single "guest" identity.
      // It should only be used for testing and trying out Backstage.
      //
      // If you want to use a production ready resolver you can switch to
      // the one that is commented out below, it looks up a user entity in the
      // catalog using the GitHub username of the authenticated user.
      // That resolver requires you to have user entities populated in the catalog,
      // for example using https://backstage.io/docs/integrations/github/org
      //
      // There are other resolvers to choose from, and you can also create
      // your own, see the auth documentation for more details:
      //
      //   https://backstage.io/docs/auth/identity-resolver

      // google: providers.google.create({
      //   signIn: {
      //     resolver: async ({ profile }, ctx) => {
      //       if (!profile.email) {
      //         throw new Error('Login Failed');
      //       }

      //       const [localPart, domain] = profile.email.split('@');

      //       const org = domain;

      //       function validateDomain(organization: string): boolean {
      //         let company = false;

      //         if (
      //           organization === '@google.com.br'
      //         ) {
      //           company = true;
      //           return company;
      //         }

      //         return company;
      //       }

      //       if (validateDomain(org) === false) {
      //         throw new Error(
      //           `E-mail ${profile.email} não pertence ao domínio`,
      //         );
      //       }

      //       const userEntity = stringifyEntityRef({
      //         apiVersion: 'backstage.io/v1alpha1',
      //         kind: 'User',
      //         name: localPart,
      //         metadata: {
      //           name: localPart,
      //           namespace: DEFAULT_NAMESPACE,
      //           annotations: {
      //             'google.com/user-email': profile.email,
      //           },
      //         },
      //         spec: {
      //           userAuthRef: profile.email,
      //         },
      //       });

      //       return ctx.issueToken({
      //         claims: {
      //           sub: userEntity,
      //           ent: [userEntity],
      //         },
      //       });
      //     },
      //   },
      // }),

      github: providers.github.create({
        signIn: {
          resolver: providers.github.resolvers.usernameMatchingUserEntityName(),
        },
      }),
    },
  });
}
