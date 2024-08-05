import { race, shield } from 'graphql-shield';
import { userRules } from '@/middleware/permissions/user/permissions';
import { apiKeyOnly } from '@/middleware/permissions/rules/rules';
import { IOptionsConstructor } from 'graphql-shield/typings/types';
import { campRules } from '@/middleware/permissions/camp/permissions';
import { default_deny, merge_rules, print_rules } from '@/middleware/utils';

/**
 *
 * Options object for the shield middleware.
 *
 */
const shieldOptions: IOptionsConstructor = {
  allowExternalErrors: process.env.NODE_ENV === 'development',
  debug: process.env.NODE_ENV === 'development',
  fallbackRule: race(
    apiKeyOnly,
    default_deny('default_deny_accessValidator', 'Access validation')
  ),
  fallbackError: 'Not authorised or not enough index to access this resource!',
};

/**
 *
 * GraphQL shield middleware configuration for authorization rules.
 *
 */
export const access_validation_shield = shield(
  merge_rules(userRules, campRules),
  shieldOptions
);

// print the rule summary
print_rules('Access Validator', merge_rules(userRules, campRules));
