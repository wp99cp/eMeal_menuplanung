'use client';

import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { getSession } from 'next-auth/react';

const httpLink = new HttpLink({
  uri: process.env.GRAPHQL_URL,
  credentials: 'include',
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.GRAPHQL_URL_WS as string,

    // set the cookies as headers
    connectionParams: async () => {
      const session = await getSession();

      // get the session token from the local cookie store
      const session_token = session?.['next-auth.session-token'];
      return { session_token };
    },
  })
);

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

export type GraphQLClient = ApolloClient<object>;

export const apollo_client: GraphQLClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
