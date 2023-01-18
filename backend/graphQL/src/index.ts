import {makeExecutableSchema} from "@graphql-tools/schema";
import {ApolloServer} from "@apollo/server";
import {expressMiddleware} from "@apollo/server/express4";
import express from "express";
import {createServer} from "http";
import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/typeDefs";
import cors from "cors";
import {json} from "body-parser";

const main = async () => {


    // Create an Express app and HTTP server; we will attach both the WebSocket
    // server and the ApolloServer to this HTTP server.
    const app = express();
    const httpServer = createServer(app);

    const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
    });


    const server = new ApolloServer({
        schema,
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
            context: async ({req}): Promise<any> => {
                return {};
            },
        })
    );

    await new Promise<void>((resolve) => httpServer.listen({port: 4000}, resolve));
    console.log(`🚀 GraphQL server ready!`);

}

main().catch((err) => console.log(err));