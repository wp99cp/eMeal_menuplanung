import { ReactNode } from 'react';
import { ApolloProvider } from '@/graphql/ApolloProvider';
import SpeedDial from '@/components/navigation/SpeedDial';
import BreadcrumbsNav from '@/components/navigation/BreadcrumbsNav';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BreadcrumbsNav />

      <div className="relative flex-1 p-2 pt-6 pb-12">
        <section>
          {/* Include shared UI here e.g. a header or sidebar */}
          <ApolloProvider>{children}</ApolloProvider>
        </section>

        <SpeedDial />
      </div>
    </>
  );
}
