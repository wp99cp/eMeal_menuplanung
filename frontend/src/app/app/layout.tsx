import { ReactNode } from 'react';
import { ApolloProvider } from '@/graphql/ApolloProvider';
import SpeedDial from '@/components/navigation/SpeedDial';
import BreadcrumbsNav from '@/components/navigation/BreadcrumbsNav';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BreadcrumbsNav />

      <div className="relative contents min-h-[500px] flex-1 p-2 pb-12 pt-6 lg:p-6">
        <section className="m-8">
          {/* Include shared UI here e.g. a header or sidebar */}
          <ApolloProvider>{children}</ApolloProvider>
        </section>

        <SpeedDial />
      </div>
    </>
  );
}
