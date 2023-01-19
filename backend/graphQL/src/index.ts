import {makeExecutableSchema} from "@graphql-tools/schema";
import {ApolloServer} from "@apollo/server";
import {expressMiddleware} from "@apollo/server/express4";
import express from "express";
import {createServer} from "http";
import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/typeDefs";
import cors from "cors";
import {json} from "body-parser";
import {getSession} from "next-auth/react";
import {GraphQLContext, Session} from "./util/types";
import {ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer';
import {PrismaClient} from "@prisma/client";


const main = async () => {

    const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
    });


    // Create an Express app and HTTP server; we will attach both the WebSocket
    // server and the ApolloServer to this HTTP server.
    const app = express();
    const httpServer = createServer(app);


    const server = new ApolloServer<GraphQLContext>({
        schema,
        csrfPrevention: true,
        plugins: [ApolloServerPluginDrainHttpServer({httpServer})],

    });

    await server.start();

    const corsOptions = {
        origin: process.env.GRAPHQL_CORS_ORIGIN,
        credentials: true
    };

    const prisma = new PrismaClient();

    app.use(
        process.env.GRAPHQL_ENDPOINT as string,
        cors<cors.CorsRequest>(corsOptions),
        json(),
        expressMiddleware(server, {
            context: async ({req, res}): Promise<GraphQLContext> => {
                const session = await getSession({req}) as Session;
                return {session, prisma};
            }
        }),
    );

    await new Promise<void>((resolve) =>
        httpServer.listen({port: process.env.GRAPHQL_PORT}, resolve));

    console.log(`🚀 GraphQL server ready (at ${process.env.GRAPHQL_URL})`);

}

main().catch((err) => console.log(err));