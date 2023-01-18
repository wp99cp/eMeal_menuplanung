import {signIn, signOut} from 'next-auth/react'
import {NextPage} from "next";
import {useMutation} from "@apollo/client";
import UserOperations from "@/graphql/operations/user";
import {CreateUserNameData, CreateUserNameVars} from "@/util/types";


const Home: NextPage = () => {

    const [createUsername, {
        data,
        loading,
        error
    }] = useMutation<CreateUserNameData, CreateUserNameVars>(UserOperations.Mutation.createUser);

    const onSubmit = async () => createUsername({variables: {username: "test"}})
        .then(res => console.log('Response: ', res));

    return <div>
        <button onClick={() => signOut()}>Sign Out</button>
        <button onClick={() => signIn('google')}>Sign In</button>
        <button onClick={() => onSubmit()}>Update User...</button>
    </div>
}

export default Home

