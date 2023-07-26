import { readFileSync } from 'fs';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphqlResolver } from '@/resolvers';
import { GraphQLSchema } from 'graphql/type';
import { applyMiddleware } from 'graphql-middleware';
import { graphQLShield } from '@/permissions';

const typeDefs = readFileSync('../../common/graphQL/schema.graphql', {
  encoding: 'utf-8',
});

const schemaWithoutShield = makeExecutableSchema({
  typeDefs,
  resolvers: graphqlResolver,
});
export const schema: GraphQLSchema = applyMiddleware(schemaWithoutShield, graphQLShield);
