import {ISODateString} from "next-auth";
import {PrismaClient} from "@prisma/client";

export interface GraphQLContext {
    session: Session | null;
    prisma: PrismaClient
    // pubsub

}


/**
 * Users
 */

export interface Session {
    user?: User;
    expires: ISODateString;
}

export interface User {

    id: string;
    name: string;
    email: string;
    image?: string;
    username?: string;
    emailVerified?: boolean;
}

export interface CreateUserNameResponse {
    success?: boolean
    error?: string
}