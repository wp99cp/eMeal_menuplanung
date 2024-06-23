import { allow, and, deny, IRules } from 'graphql-shield';
import { hasUserId, isAuthenticated } from '@/permissions/rules/rules';
import { passedValidUsername } from '@/permissions/rules/input_validation';

// Fallback rule for all other rules: apiKeyOnly
export const userRules: IRules = {
  Query: {
    users: isAuthenticated,
  },

  Mutation: {
    updateUser: and(isAuthenticated, hasUserId, passedValidUsername),
    createNewUser: allow,
  },

  Subscription: deny,

  User: allow,
};
