import {signIn, signOut, useSession} from 'next-auth/react'
import {NextPage} from "next";


const Home: NextPage = () => {

    const {data} = useSession()

    return <div>
        {
            data?.user ? (
                <button onClick={() => signOut()}>Sign Out</button>
            ) : (
                <button onClick={() => signIn('google')}>Sign In</button>
            )
        }
        <br />
        {data?.user?.name}
    </div>
}

export default Home

