import { allow, and, deny, IRules } from 'graphql-shield';
import { hasUserId, isAuthenticated } from '@/permissions/rules/rules';
import {
  paginationLimitation,
  passedValidUsername,
} from '@/permissions/rules/input_validation';

// Fallback rule for all other rules: apiKeyOnly
export const userRules: IRules = {
  Query: {
    users: and(isAuthenticated, paginationLimitation(100)),
  },

  Mutation: {
    updateUser: and(isAuthenticated, hasUserId, passedValidUsername),
    createNewUser: allow,
  },

  Subscription: deny,

  User: allow,
};
