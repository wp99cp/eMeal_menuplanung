import { PrismaClient as PrismaDefaultClient } from '@prisma/client';
import {
  getUserId,
  isAuthenticatedUsingAPIToken,
  retrieveSession,
} from '@/apolloServer/authentication';
import { ContextFunction } from '@apollo/server';
import { ExpressContextFunctionArgument } from '@apollo/server/express4';

import { traceWrapper } from '@/tracing/traceWrapper';
import { MongoClient } from 'mongodb';
import { Session } from '@/util/types/types';
import { withChangeListener } from '@/util/prisma/extensions/subscribe';

const mongoClient = new MongoClient(process.env.DATABASE_URL_MONGODB as string, {});
const connectedMongoDBClient = mongoClient
  .connect()
  .then((db) => db.db('eMeal_menuplanung'));

const defaultPrisma = new PrismaDefaultClient();
const prisma = defaultPrisma.$extends(
  withChangeListener({ mongoClient: connectedMongoDBClient })
);

export type PrismaClient = typeof prisma;

/**
 * Closes the database connections for Prisma and MongoDB-Client
 *
 */
export const closeDBConnections = async (): Promise<void> => {
  await mongoClient.close();
  await prisma.$disconnect();
};

export type GraphQLContext = {
  user_id?: string;
  api_key?: boolean;
  prisma: PrismaClient;
};

export type SubscriptionContext = {
  connectionParams: {
    session?: Session;
    'x-api-key'?: string;
    'x-user-id'?: string;
  };
};

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
> = traceWrapper(async ({ req }): Promise<GraphQLContext> => {
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
  const treat_as_user = !!user_id && req.headers['§'] === 'true';

  return {
    user_id,
    api_key: has_valid_api_key && !treat_as_user,
    prisma: prisma,
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
export const subscriptionContextFunction = async (
  ctx: SubscriptionContext
): Promise<GraphQLContext> => {
  const api_token: string | undefined = ctx.connectionParams?.['x-api-key'];
  const has_valid_api_key = isAuthenticatedUsingAPIToken(api_token);

  return {
    user_id: getUserId(
      ctx?.connectionParams?.session,
      has_valid_api_key,
      ctx?.connectionParams
    ),
    api_key: has_valid_api_key,
    prisma: prisma,
  };
};

export const metricsContextFunction = () => {
  return { prisma: defaultPrisma };
};
