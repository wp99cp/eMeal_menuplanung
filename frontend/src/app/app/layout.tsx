'use client';

import { ReactNode } from 'react';
import { ApolloProvider } from '@/graphql/ApolloProvider';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      {/* Include shared UI here e.g. a header or sidebar */}
      <nav>Nav shared between all app components</nav>
      <ApolloProvider>{children}</ApolloProvider>
    </section>
  );
}
