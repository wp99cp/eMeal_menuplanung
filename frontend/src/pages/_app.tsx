import { AppProps } from 'next/app';
import { getSession, SessionProvider } from 'next-auth/react';
import { ApolloProvider } from '@apollo/client';
import { apollo_client } from '@/graphql/apollo-client';
import '@/styles/global.css';

// default font of the app
import HeaderNav from '@/components/HeaderNav';
import { NextPageContext } from 'next';
import { Session } from 'next-auth';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session}>
      <ApolloProvider client={apollo_client}>
        <HeaderNav />

        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Dashboard
            </h1>
          </div>
        </header>

        <main>
          <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            <div className="py-8">
              <Component {...pageProps} />
            </div>
          </div>
        </main>
      </ApolloProvider>
    </SessionProvider>
  );
}

export async function getServerSideProps(ctx: NextPageContext) {
  const session = await getSession(ctx);

  return {
    props: {
      session,
    },
  };
}
