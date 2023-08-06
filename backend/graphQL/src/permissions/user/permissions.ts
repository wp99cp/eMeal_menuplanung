import { allow, and, IRules } from 'graphql-shield';
import {
  hasUserId,
  isAuthenticated,
  paginationLimitation,
  passedValidUsername,
} from '@/permissions/rules/rules';

// Fallback rule for all other rules: apiKeyOnly
export const userRules: IRules = {
  Query: {
    users: and(isAuthenticated, paginationLimitation(100)),
  },

  Mutation: {
    updateUser: and(isAuthenticated, hasUserId, passedValidUsername),
    createNewUser: allow,
  },

  User: allow,
};
