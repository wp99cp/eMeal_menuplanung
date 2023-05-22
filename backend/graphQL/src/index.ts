import express from 'express';
import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { json } from 'body-parser';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { GraphQLContext, SubscriptionContext } from '@/util/types/types';
import { readFileSync } from 'fs';
import { resolvers } from '@/graphql/resolvers';
import { PrismaClient } from '@prisma/client';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';
import { applyMiddleware } from 'graphql-middleware';
import { GraphQLSchema } from 'graphql/type';
import { permissions } from '@/graphql/permissions';

const isAuthenticatedUsingAPIToken = (api_token: string | undefined) => {
  // Otherwise, we check if the request has the `x-authenticated` header set
  // and a valid api key is provided. If the header is not set, we block the request
  if (!api_token) return false;

  // if the header is set, we check if the api key is valid
  return api_token === (process.env.GRAPHQL_API_KEY as string);
};

const loadSchema = (): GraphQLSchema => {
  // load type defs from schema.graphql
  const typeDefs = readFileSync('../../common/graphQL/schema.graphql', {
    encoding: 'utf-8',
  });

  return makeExecutableSchema({ typeDefs, resolvers });
};

const main = async () => {
  const schema: GraphQLSchema = applyMiddleware(loadSchema(), permissions);

  // Create an Express app and HTTP server; we will attach both the WebSocket
  // server and the ApolloServer to this HTTP server.
  const app = express();

  // Creating the HTTP server and WebSocket server
  const httpServer = createServer(app);
  const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if app.use
    // serves expressMiddleware at a different path
    path: '/graphql',
  });

  const prisma = new PrismaClient();
  const pubsub = new PubSub();

  const getSubscriptionContext = async (
    ctx: SubscriptionContext
  ): Promise<GraphQLContext> => {
    const api_token: string | undefined = ctx.connectionParams?.['x-api-key'];
    const has_valid_api_key = isAuthenticatedUsingAPIToken(api_token);

    return {
      user_id:
        (ctx.connectionParams && ctx.connectionParams.session?.user?.id) ||
        (has_valid_api_key && (ctx.connectionParams?.['x-user-id'] as string)) ||
        '',
      api_key: has_valid_api_key,
      prisma,
      pubsub,
    };
  };

  // Save the returned server's info so we can shutdown this server later
  const serverCleanup = useServer(
    {
      schema,
      context: (ctx: SubscriptionContext) => {
        // This will be run every time the client sends a subscription request
        // Returning an object will add that information to our
        // GraphQL context, which all of our resolvers have access to.
        return getSubscriptionContext(ctx);
      },
    },
    wsServer
  );

  const server = new ApolloServer<GraphQLContext>({
    schema,
    csrfPrevention: true,
    formatError: (err) => {
      // Don't give the specific errors to the client
      if (err.message.startsWith('Database Error: ')) {
        return new Error('Internal server error');
      }

      // clear out stack trace
      if (err.extensions?.stacktrace) {
        delete err.extensions.stacktrace;
      }

      // Otherwise return the original error
      return err;
    },
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),

      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  const corsOptions = {
    origin: process.env.GRAPHQL_CORS_ORIGIN,
    credentials: true,
  };

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
          .then((res) => (res.ok ? res.json() : null))
          .catch(console.error);

        const apiKey = req.headers['x-api-key'] as string;
        const has_valid_api_key = isAuthenticatedUsingAPIToken(apiKey);
        return {
          user_id:
            session?.user?.id ||
            (has_valid_api_key && (req.headers['x-user-id'] as string)) ||
            '',
          api_key: has_valid_api_key,
          prisma,
          pubsub,
        };
      },
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: process.env.GRAPHQL_PORT }, resolve)
  );

  console.log(`🚀 GraphQL server ready (at ${process.env.GRAPHQL_URL})`);

  // Requests to `/health` now return "Okay!"
  app.get('/health', (req, res) => {
    res.status(200).send('Okay!');
  });
};

main().catch((err) => console.log(err));
