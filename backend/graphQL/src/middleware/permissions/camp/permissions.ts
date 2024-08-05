import { and, IRules, rule } from 'graphql-shield';
import { GraphQLContext } from '@/apolloServer/context';
import { allow, hasUserId, isAuthenticated } from '@/middleware/permissions/rules/rules';

// Fallback rule for all other rules: apiKeyOnly
export const campRules: IRules = {
  Query: {
    // the check will be done at object level
    camp: allow,
    camps: and(isAuthenticated, hasUserId),
  },
  Mutation: {
    updateDay: rule('updateDay')(async (_, __, { api_key }: GraphQLContext) => {
      return !!api_key;
    }),

    updateCamp: rule('updateCamp')(
      async (parent, __, { user_id, api_key }: GraphQLContext) => {
        if (api_key) return true;
        if (!user_id) throw new Error('Not authorised to access this resource!');

        // check if userId is in ownerId, memberIds or viewerIds
        return user_id === parent.ownerId;
      }
    ),

    createCamp: rule('createCamp')(
      async (_, __, { user_id, api_key }: GraphQLContext) => {
        if (api_key) return true;
        if (!user_id) throw new Error('Not authorised to create a camp!');
        return !!api_key;
      }
    ),
  },

  Subscription: {
    // the check will be done at object level
    camp: allow,
  },

  Camp: rule('Camp')(async (parent, _, { user_id, api_key }: GraphQLContext) => {
    // allow if api_key is set
    if (api_key) return true;

    // check if userId is in ownerId, memberIds or viewerIds
    return user_id === parent.ownerUserId;
  }),
};
