import {NextPage} from "next";
import Auth from "@/components/Auth";
import {useSession} from "next-auth/react";

const Login: NextPage = () => {

    const {data: session} = useSession();
    
    return <>
        <Auth/>
    </>;

};

export default Login;