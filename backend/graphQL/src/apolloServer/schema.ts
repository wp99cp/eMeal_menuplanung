import * as fs from 'fs';
import { readFileSync } from 'fs';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphqlResolver } from 'src/resolver';
import { GraphQLSchema } from 'graphql/type';
import { applyMiddleware } from 'graphql-middleware';
import { rateLimitDirectiveTransformer } from '@/apolloServer/rateLimiter';
import * as path from 'path';

import { input_validator_shield } from 'src/middleware/input_validation';
import { access_validation_shield } from 'src/middleware/permissions';
import { global_rules_shield } from '@/middleware/global_rules';

const folderName = '../../common/graphQL';
const schemaFiles = fs
  .readdirSync(folderName)
  .filter((file) => file.endsWith('.graphql'));
const typeDefs = schemaFiles
  .map((file) => {
    return readFileSync(path.join(folderName, file), {
      encoding: 'utf-8',
    });
  })
  .join('\n');

const schemaWithoutShield = makeExecutableSchema({
  typeDefs,
  resolvers: graphqlResolver,
});

const schemaWithRateLimiter = rateLimitDirectiveTransformer(schemaWithoutShield);

const middlewares = [
  input_validator_shield,
  access_validation_shield,
  global_rules_shield,
];

export const schema: GraphQLSchema = applyMiddleware(
  schemaWithRateLimiter,
  ...middlewares
);
