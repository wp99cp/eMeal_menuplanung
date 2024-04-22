import { allow, IRules, rule } from 'graphql-shield';
import { GraphQLContext } from '@/apolloServer/context';
import logger from '@/logger/logger';

// Fallback rule for all other rules: apiKeyOnly
export const campRules: IRules = {
  Query: {
    camp: rule()(async (_, __, ctx: GraphQLContext) => {
      logger.debug('Query.camp rule');
      return true;
    }),
  },
  Mutation: {
    updateDay: rule()(async (_, __, ctx: GraphQLContext) => {
      logger.debug('Mutation.updateDay rule');
      return true;
    }),

    updateCamp: rule()(async (_, __, ctx: GraphQLContext) => {
      logger.debug('Mutation.updateCamp rule');
      return true;
    }),
  },

  Subscription: allow, // the access checks are done on type level

  Camp: rule()(async (parent, _, { user_id, api_key }: GraphQLContext) => {
    // allow if api_key is set
    if (api_key) return true;
    if (!user_id) throw new Error('Not authorised to access this resource!');

    // check if userId is in ownerId, memberIds or viewerIds
    return user_id !== parent.ownerId;
  }),
};
