import {AppProps} from "next/app";
import {SessionProvider} from "next-auth/react"
import {ApolloProvider} from "@apollo/client";
import {apollo_client} from "@/graphql/apollo-client";


export default function App({Component, pageProps: {session, ...pageProps}}: AppProps) {

    return (
        <SessionProvider session={session}>
            <ApolloProvider client={apollo_client}>
                <Component {...pageProps} />
            </ApolloProvider>
        </SessionProvider>
    );

}