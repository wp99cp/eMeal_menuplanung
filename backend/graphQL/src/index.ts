import express, { Request } from 'express';
import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { json } from 'body-parser';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { GraphQLContext, Session } from '@/util/types/types';
import { readFileSync } from 'fs';
import { resolvers } from '@/graphql/resolvers';
import { PrismaClient } from '@prisma/client';
import { GraphQLError } from 'graphql/error';

const isAuthenticated = (session: Session, req: Request) => {
  // if user is authenticated via next-auth, we allow the request
  if (session?.user) return true;

  // Otherwise, we check if the request has the `x-authenticated` header set
  // and a valid api key is provided. If the header is not set, we block the request
  const apiKey = req.headers['x-api-key'] as string;
  if (!apiKey) return false;

  // if the header is set, we check if the api key is valid
  return apiKey === (process.env.GRAPHQL_API_KEY as string);
};

const isPublicOperation = (req: Request) => {
  const publicOperations = ['createNewUser'];
  return req.body.operationName && publicOperations.includes(req.body.operationName);
};

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
        // retrieve the session
        const session = await fetch(
          `${process.env.NEXTAUTH_URL_INTERNAL}/api/auth/session`,
          { headers: { cookie: req.headers.cookie as string } }
        )
          .then((res: any) => (res.ok ? res.json() : null))
          .catch((err: any) => console.error);

        // We block all unauthorized requests here
        if (!isAuthenticated(session, req) && !isPublicOperation(req))
          // throwing a `GraphQLError` here allows us to specify an HTTP status code,
          // standard `Error`s will have a 500 status code by default
          throw new GraphQLError('User is not authenticated', {
            extensions: {
              code: 'UNAUTHENTICATED',
              http: { status: 401 },
            },
          });

        return {
          user_id: session?.user?.id || (req.headers['x-user-id'] as string) || '',
          session,
          prisma,
        };
      },
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: process.env.GRAPHQL_PORT }, resolve)
  );

  console.log(`🚀 GraphQL server ready (at ${process.env.GRAPHQL_URL})`);
};

main().catch((err) => console.log(err));
