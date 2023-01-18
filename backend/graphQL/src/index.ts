import {makeExecutableSchema} from "@graphql-tools/schema";
import {ApolloServer} from "@apollo/server";
import {expressMiddleware} from "@apollo/server/express4";
import express from "express";
import {createServer} from "http";
import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/typeDefs";
import cors from "cors";
import {json} from "body-parser";
import {getSession, useSession} from "next-auth/react";
import {GraphQLContext} from "./util/types";
import {ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer';


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

    app.use(
        process.env.GRAPHQL_ENDPOINT as string,
        cors<cors.CorsRequest>(corsOptions),
        json(),
        expressMiddleware(server, {
            context: async ({req, res}): Promise<GraphQLContext> => {
                const session = await getSession({req});
                return {session};
            }
        }),
    );

    await new Promise<void>((resolve) =>
        httpServer.listen({port: process.env.GRAPHQL_PORT}, resolve));

    console.log(`🚀 GraphQL server ready (at ${process.env.GRAPHQL_URL})`);

}

main().catch((err) => console.log(err));