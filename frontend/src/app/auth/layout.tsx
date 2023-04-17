import { ReactNode } from 'react';
import { ApolloProvider } from '@/graphql/ApolloProvider';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ApolloProvider>
        <div className="flex h-full place-content-center">{children}</div>
      </ApolloProvider>
    </>
  );
}
