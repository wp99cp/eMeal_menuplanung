import express from 'express';
import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { json } from 'body-parser';
import { getSession } from 'next-auth/react';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { GraphQLContext, Session } from '@/util/types/types';
import { readFileSync } from 'fs';
import { resolvers } from '@/graphql/resolvers';
import { PrismaClient } from '@prisma/client';

const main = async () => {
  const typeDefs = readFileSync('../../common/graphQL/schema.graphql', {
    encoding: 'utf-8',
  });

  // Create an Express app and HTTP server; we will attach both the WebSocket
  // server and the ApolloServer to this HTTP server.
  const app = express();
  const httpServer = createServer(app);

  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  const corsOptions = {
    origin: process.env.GRAPHQL_CORS_ORIGIN,
    credentials: true,
  };

  const prisma = new PrismaClient();

  app.use(
    process.env.GRAPHQL_ENDPOINT as string,
    cors<cors.CorsRequest>(corsOptions),
    json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<GraphQLContext> => {
        const session = (await getSession({ req })) as unknown as Session;
        return { session, prisma };
      },
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: process.env.GRAPHQL_PORT }, resolve)
  );

  console.log(`🚀 GraphQL server ready (at ${process.env.GRAPHQL_URL})`);
};

main().catch((err) => console.log(err));
