import { and, IRules, shield } from 'graphql-shield';
import { allow } from '@/middleware/permissions/rules/rules';
import { IOptionsConstructor } from 'graphql-shield/typings/types';
import { default_deny, merge_rules, print_rules } from '@/middleware/utils';
import {
  hasValidUUID,
  isValidCampInput,
} from '@/middleware/input_validation/rules/rules';

const shieldOptionsInputValidation: IOptionsConstructor = {
  allowExternalErrors: process.env.NODE_ENV === 'development',
  debug: process.env.NODE_ENV === 'development',
  fallbackRule: default_deny('default_deny_input_validation', 'Input validation'),
  fallbackError: 'Request failed due to input validation!',
};

const inputValidationRules: IRules = {
  Query: {
    camp: hasValidUUID,
  },

  Subscription: {
    camp: hasValidUUID,
  },

  Camp: allow,
  CampAcknowledgement: allow,

  Mutation: {
    createCamp: and(isValidCampInput, hasValidUUID),
    updateCamp: and(isValidCampInput, hasValidUUID),
  },
};
export const input_validator_shield = shield(
  merge_rules(inputValidationRules),
  shieldOptionsInputValidation
);

// print the rule summary
print_rules('Input Validator', merge_rules(inputValidationRules));
