import { and, IRules, rule } from 'graphql-shield';
import {
  allow,
  deny,
  hasUserId,
  isAuthenticated,
} from '@/middleware/permissions/rules/rules';
import { passedValidUsername } from '@/middleware/input_validation/rules/rules';
import { GraphQLContext } from '@/apolloServer/context';

// Fallback rule for all other rules: apiKeyOnly
export const userRules: IRules = {
  Query: {
    users: and(isAuthenticated),
    user: and(isAuthenticated, hasUserId),
  },

  Mutation: {
    updateUser: and(isAuthenticated, hasUserId, passedValidUsername),
    createNewUser: allow,
  },

  Subscription: deny,

  User: rule('check_user_access')(
    async (parent, ctx, { user_id, api_key }: GraphQLContext) => {
      // allow if api_key is set
      if (api_key) return true;

      // every user is allowed to see their own data
      if (user_id === parent.id) return true;

      // assert that the user is not hidden
      if (parent.isHiddenUser) throw new Error('Cannot hidden users!');
      return true;
    }
  ),
};
