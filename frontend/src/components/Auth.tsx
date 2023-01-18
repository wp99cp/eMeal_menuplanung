import {getSession, signIn, signOut} from "next-auth/react";
import {NextPageContext} from "next";
import {Session} from "next-auth";


interface AuthProps {
    session: Session | null;
    reloadSession: () => void;
}

const Auth: React.FC<AuthProps> = ({session, reloadSession}) => {


    return <>
        {session ? (
            <>
                Signed in as {session.user.username} ({session.user.email}) <br/>
                <button onClick={() => signOut()}>Sign out</button>
            </>
        ) : (
            <>
                Not signed in <br/>
                <button onClick={() => signIn()}>Sign in</button>
            </>
        )}
    </>;
}

export async function getServersideProps(context: NextPageContext) {
    return {
        props: {
            session: await getSession(context)
        }
    }
}

export default Auth;