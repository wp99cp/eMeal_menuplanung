import {CreateUserNameResponse, GraphQLContext} from "../../util/types";

const resolvers = {
    Query: {
        searchUser: () => {
            return [
                {
                    id: "1",
                    username: "test",
                },
            ];
        }
    },
    Mutation: {
        createUser: (_: any, args: { username: string }, context: GraphQLContext): Promise<CreateUserNameResponse> => {

            const {username} = args;
            console.log("Username updated to: ", username, "of user ", context.session?.user?.email);
            return new Promise(res => res({success: false, error: "No Database configured!"}));

        },
    },
    Subscription: {},
};

export default resolvers;