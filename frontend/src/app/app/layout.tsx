import { ReactNode } from 'react';
import { ApolloProvider } from '@/graphql/ApolloProvider';
import SpeedDial from '@/components/navigation/SpeedDial';


export default function AppLayout({ children }: { children: ReactNode }) {

  return (
    <div className='relative flex-1'>
      <section>
        {/* Include shared UI here e.g. a header or sidebar */}
        <ApolloProvider>{children}</ApolloProvider>
      </section>

      <SpeedDial />
    </div>
  );
}
