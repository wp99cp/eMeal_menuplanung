import { PrismaClient } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';
import { GraphQLContext, SubscriptionContext } from '@/util/types/types';
import {
  getUserId,
  isAuthenticatedUsingAPIToken,
  retrieveSession,
} from '@/apolloServer/authentication';
import { ContextFunction } from '@apollo/server';
import { ExpressContextFunctionArgument } from '@apollo/server/express4';

const prisma = new PrismaClient();
const pubsub = new PubSub();

/**
 *
 * Generates the context object for a query or mutation based on the provided SubscriptionContext.
 *
 * @param ctx - The SubscriptionContext object containing connection parameters.
 * @returns The context object.
 *
 */
export const contextFunction: ContextFunction<
  [ExpressContextFunctionArgument],
  GraphQLContext
> = async ({ req }) => {
  const session = await retrieveSession(req);
  const apiKey = req.headers['x-api-key'] as string;
  const has_valid_api_key = isAuthenticatedUsingAPIToken(apiKey);
  return {
    user_id: getUserId(session, has_valid_api_key, req.headers),
    api_key: has_valid_api_key,
    prisma,
    pubsub,
  };
};

/**
 *
 * Generates the context object for a subscription based on the provided SubscriptionContext.
 *
 * @param ctx - The SubscriptionContext object containing connection parameters.
 * @returns The context object.
 *
 */
export const subscriptionContextFunction = (ctx: SubscriptionContext) => {
  const api_token: string | undefined = ctx.connectionParams?.['x-api-key'];
  const has_valid_api_key = isAuthenticatedUsingAPIToken(api_token);

  return {
    user_id: getUserId(
      ctx?.connectionParams?.session,
      has_valid_api_key,
      ctx?.connectionParams
    ),
    api_key: has_valid_api_key,
    prisma,
    pubsub,
  };
};
