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
        createUser: (_: any, args: { username: string }) => {
            const {username} = args;
            console.log("Username: ", username);
            return {success: false, error: "No Database configured!"};
        },
    },
    Subscription: {},
};

export default resolvers;