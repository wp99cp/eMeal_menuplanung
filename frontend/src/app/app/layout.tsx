import { ReactNode } from 'react';
import { ApolloProvider } from '@/graphql/ApolloProvider';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      {/* Include shared UI here e.g. a header or sidebar */}
      <ApolloProvider>{children}</ApolloProvider>
    </section>
  );
}
