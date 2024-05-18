import '@/tracing/tracing';
import express from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { json } from 'body-parser';
import { contextFunction } from '@/apolloServer/context';
import { createApolloServer } from '@/apolloServer/apolloServer';
import { createServer, Server } from 'http';
import { addRouteHandlers } from '@/apolloServer/routeHandler';
import logger from '@/logger/logger';

/**
 *
 * The main function to start the GraphQL server.
 * Sets up an Express app, HTTP server, WebSocket server, Apollo Server,
 * route handlers, and starts the server.
 *
 */
const main = async (): Promise<void> => {
  // Create an Express app and HTTP server; we will attach both the WebSocket
  // server and the Apollo Server to this HTTP server.
  const app = express();

  // Creating the HTTP server
  const httpServer: Server = createServer(app);

  // Create and start the Apollo Server
  const server = createApolloServer(httpServer);
  await server.start();

  // Add middleware and Apollo Server to the Express app
  app.use(
    process.env.GRAPHQL_ENDPOINT as string,
    cors<cors.CorsRequest>({
      origin: process.env.GRAPHQL_CORS_ORIGIN,
      credentials: true,
    }),
    json(),
    expressMiddleware(server, { context: contextFunction })
  );

  // Start the HTTP server
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: process.env.GRAPHQL_PORT }, resolve)
  );

  // Add additional route handlers if needed
  addRouteHandlers(app);
  logger.info(`🚀 GraphQL server ready (at ${process.env.GRAPHQL_URL})`);
};

main().catch((err) => {
  logger.error('Unhandled error: ', err);
  logger.error(err.stack);
  logger.error('Shutting down server');
});
