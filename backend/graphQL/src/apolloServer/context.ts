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

import { traceWrapper } from '@/tracing/traceWrapper';

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
> = traceWrapper(async ({ req }) => {
  const apiKey = req.headers['x-api-key'] as string;
  const has_valid_api_key = isAuthenticatedUsingAPIToken(apiKey);

  const session = !has_valid_api_key ? await traceWrapper(retrieveSession)(req) : null;
  const user_id = getUserId(session, has_valid_api_key, req.headers);

  /*
   * The header 'x-treat-as-user' allows authentication using an API key,
   * If this header is set and the user_id is passed using the x-user-id header,
   * the backend treats that request as if it was made by the user with the provided user_id
   * (i.g. without using an API key for authentication).
   */
  const treat_as_user = !!user_id && req.headers['x-treat-as-user'] === 'true';

  return {
    user_id,
    api_key: has_valid_api_key && !treat_as_user,
    prisma,
    pubsub,
  };
}, 'contextFunction');

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

export const metricsContextFunction = () => {
  return { prisma };
};
