import { allow, IRules, shield } from 'graphql-shield';
import { userRules } from '@/middleware/permissions/user/permissions';
import { IOptionsConstructor } from 'graphql-shield/typings/types';
import { campRules } from '@/middleware/permissions/camp/permissions';
import { merge_rules, print_rules } from '@/middleware/utils';
import { paginationLimitation } from '@/middleware/global_rules/rules/rules';

/**
 *
 * Options object for the shield middleware.
 *
 */
const shieldOptions: IOptionsConstructor = {
  allowExternalErrors: process.env.NODE_ENV === 'development',
  debug: process.env.NODE_ENV === 'development',
  fallbackRule: allow,
  fallbackError: 'Request failed due to global rules validation!',
};

const global_rule_set: IRules = {
  Query: paginationLimitation(10), // default pagination limitation
};

/**
 *
 * GraphQL shield middleware configuration for authorization rules.
 *
 */
export const global_rules_shield = shield(global_rule_set, shieldOptions);

// print the rule summary
print_rules('Global', merge_rules(userRules, campRules));
