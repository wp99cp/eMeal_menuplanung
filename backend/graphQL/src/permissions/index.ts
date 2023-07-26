import { allow, shield } from 'graphql-shield';
import { userRules } from '@/permissions/user/permissions';
import { apiKeyOnly } from '@/permissions/rules/rules';
import { IOptionsConstructor } from 'graphql-shield/typings/types';

/**
 *
 * Options object for the shield middleware.
 *
 */
const shieldOptions: IOptionsConstructor = {
  allowExternalErrors: process.env.NODE_ENV === 'development',
  debug: process.env.NODE_ENV === 'development',
  fallbackRule: apiKeyOnly,
  fallbackError: 'Not authorised or not enough index to access this resource!',
};

/**
 *
 * GraphQL shield middleware configuration for authorization rules.
 *
 */
export const graphQLShield = shield(
  {
    ...userRules,
    Acknowledgement: allow,
  },
  shieldOptions
);
