import { User } from '@/util/generated/prisma/client';
import { Disposable } from 'graphql-ws';

export interface Session {
  user: User;
}

export type ApolloServerPluginDrainWebSocketServerOptions = {
  disposableServer: Disposable;
};
