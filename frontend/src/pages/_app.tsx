import {AppProps} from "next/app";
import {getSession, SessionProvider} from "next-auth/react"
import {NextPageContext} from "next";

export async function getServerSideProps(context: NextPageContext) {
    const session = await getSession(context);
    return {
        props: { session },
    };
}

export default function App({Component, pageProps: {session, ...pageProps}}: AppProps) {

    return (
        <SessionProvider session={session}>
            <Component {...pageProps} />
        </SessionProvider>
    );

}