'use client';

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const httpLink = new HttpLink({
  uri: process.env.GRAPHQL_URL,
  credentials: 'include',
});

export type GraphQLClient = ApolloClient<object>;

export const apollo_client: GraphQLClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
