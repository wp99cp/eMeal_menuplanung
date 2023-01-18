import {Session} from "next-auth";

export interface GraphQLContext {
    session: Session | null;
    // prisma
    // pubsub

}

export interface CreateUserNameResponse {
    success: boolean
    error: string
}