'use client';

import { ApolloProvider as Provider } from '@apollo/client/react/context/ApolloProvider';
import { apollo_client } from '@/graphql/apollo-client';
import { ReactNode } from 'react';

export function ApolloProvider({ children }: { children: ReactNode }) {
  return <Provider client={apollo_client}>{children}</Provider>;
}
