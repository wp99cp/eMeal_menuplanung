import {getSession, useSession} from 'next-auth/react'
import {NextPage, NextPageContext} from "next";
import {useMutation} from "@apollo/client";
import UserOperations from "@/graphql/operations/user";
import {CreateUserNameData, CreateUserNameVars} from "@/util/types";
import Auth from "@/components/Auth";


const Home: NextPage = () => {

    const {data: session} = useSession();

    console.log("Session: ", session);

    const reloadSession = () => {
        console.log("reloadSession");
    };

    const [createUsername, {
        data,
        loading,
        error
    }] = useMutation<CreateUserNameData, CreateUserNameVars>(UserOperations.Mutation.createUser);

    const onSubmit = async () => createUsername({variables: {username: "test"}})
        .then(res => console.log('Response: ', res));

    return <div>
        <Auth session={session} reloadSession={reloadSession}/>
        <br></br>
        <button onClick={() => onSubmit()}>Update User...</button>
    </div>;
}

export async function getServerSideProps(ctx: NextPageContext) {
    const session = await getSession(ctx);

    return {
        props: {
            session,
        },
    };
}

export default Home

