import { allow, and, IRules } from 'graphql-shield';
import {
  hasUserId,
  isAuthenticated,
  passedValidUsername,
} from '@/permissions/rules/rules';

export const userRules: IRules = {
  Query: {
    checkUsername: and(isAuthenticated, hasUserId, passedValidUsername),
  },

  Mutation: {
    updateUser: and(isAuthenticated, hasUserId, passedValidUsername),
    createNewUser: allow,
  },

  User: allow,
};
