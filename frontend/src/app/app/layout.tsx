'use client';

import { ReactNode } from 'react';
import { ApolloProvider } from '@/graphql/ApolloProvider';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      {/* Include shared UI here e.g. a header or sidebar */}
      <div className="relative bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
        </div>
      </div>
      <ApolloProvider>{children}</ApolloProvider>
    </section>
  );
}
