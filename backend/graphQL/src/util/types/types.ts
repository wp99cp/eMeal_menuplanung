import { PrismaClient } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';
import { Context } from 'graphql-ws/lib/server';
import { User } from '@/util/generated/prisma/client';
import { Disposable } from 'graphql-ws';

export interface GraphQLContext {
  user_id?: string;
  api_key?: boolean;
  prisma: PrismaClient;
  pubsub: PubSub;
}

export interface SubscriptionContext extends Context {
  connectionParams: {
    session?: Session;
    'x-api-key'?: string;
    'x-user-id'?: string;
  };
}

export interface Session {
  user: User;
}

export type ApolloServerPluginDrainWebSocketServerOptions = {
  disposableServer: Disposable;
};
