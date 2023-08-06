import { readFileSync } from 'fs';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphqlResolver } from '@/resolvers';
import { GraphQLSchema } from 'graphql/type';
import { applyMiddleware } from 'graphql-middleware';
import { graphQLShield } from '@/permissions';
import { rateLimitDirectiveTransformer } from '@/apolloServer/rateLimiter';

const typeDefs = readFileSync('../../common/graphQL/schema.graphql', {
  encoding: 'utf-8',
});

const schemaWithoutShield = makeExecutableSchema({
  typeDefs,
  resolvers: graphqlResolver,
});

const schemaWithRateLimiter = rateLimitDirectiveTransformer(schemaWithoutShield);

export const schema: GraphQLSchema = applyMiddleware(
  schemaWithRateLimiter,
  graphQLShield
);
