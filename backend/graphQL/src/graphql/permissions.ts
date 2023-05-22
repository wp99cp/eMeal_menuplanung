import { allow, and, rule, shield } from 'graphql-shield';
import { GraphQLContext } from '@/util/types/types';

const isAuthenticated = rule()(async (_, __, ctx: GraphQLContext) => {
  if (ctx.api_key === true || !!ctx.user_id) return true;
  return 'Not authorised to access this resource!';
});

const hasUserId = rule()(async (_, __, ctx: GraphQLContext) => {
  if (ctx.user_id) return true;
  return 'No user_id set. Are you using a api key?';
});

const apiKeyOnly = rule()((_, __, ctx: GraphQLContext) => {
  if (ctx.api_key === true) return true;
  return 'Not authorised to access this resource! Please provide an API key.';
});

export const permissions = shield(
  {
    Query: {
      checkUsername: isAuthenticated,
    },
    Mutation: {
      updateUser: and(isAuthenticated, hasUserId),
      createNewUser: allow,
    },
    Subscription: {},
    Acknowledgement: allow,
    User: allow,
  },
  {
    allowExternalErrors: false,
    debug: false,
    fallbackRule: apiKeyOnly,
    fallbackError: 'Not authorised or not enough permissions to access this resource!',
  }
);
