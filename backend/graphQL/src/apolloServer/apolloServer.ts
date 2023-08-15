import { ApolloServer } from '@apollo/server';
import { schema } from '@/apolloServer/schema';
import { useServer } from 'graphql-ws/lib/use/ws';
import {
  closeDBConnections,
  GraphQLContext,
  subscriptionContextFunction,
} from '@/apolloServer/context';
import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { Disposable } from 'graphql-ws';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginDrainWebSocketServer } from '@/apolloServer/plugins';
import {
  ApolloErrorFormatter,
  formatterComposer,
  WinstonApolloErrorExporter,
} from '@/apolloServer/formater';
import logger from '@/logger/logger';

/**
 *
 * Creates and configures an Apollo Server instance to be used with an HTTP
 * server and WebSocket server.
 *
 * @param httpServer - The HTTP server instance.
 * @returns The configured Apollo Server instance.
 *
 */
export const createApolloServer = (httpServer: Server): ApolloServer<GraphQLContext> => {
  // Create a WebSocket server using the provided HTTP server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql', // Specify the path for WebSocket connections
  });

  // Use the WebSocket server with the Apollo Server
  const disposableServer: Disposable = useServer(
    {
      schema,
      context: subscriptionContextFunction,
    },
    wsServer
  );

  // Create and configure the Apollo Server instance
  return new ApolloServer<GraphQLContext>({
    schema,
    csrfPrevention: true,
    formatError: formatterComposer(WinstonApolloErrorExporter, ApolloErrorFormatter),
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginDrainWebSocketServer({ disposableServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              logger.info('💥 Stopping the server...');
              logger.info('Closing the database connections...');
              await closeDBConnections();
            },
          };
        },
      },
    ],
  });
};
