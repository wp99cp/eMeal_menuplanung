import { allow, IRules, shield } from 'graphql-shield';
import { userRules } from '@/permissions/user/permissions';
import { apiKeyOnly } from '@/permissions/rules/rules';
import { IOptionsConstructor } from 'graphql-shield/typings/types';
import { paginationLimitation } from '@/permissions/rules/input_validation';

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

const default_rules: IRules = {
  Pagination: paginationLimitation(10), // default pagination limitation
  Acknowledgement: allow,
};

/**
 *
 * GraphQL shield middleware configuration for authorization rules.
 *
 */
export const graphQLShield = shield(
  {
    ...userRules,

    // add default rules:
    ...default_rules,
    // fallback rule for all other rules: apiKeyOnly
  },
  shieldOptions
);
