import { CreateUserNameResponse, GraphQLContext } from "../../util/types";

const resolvers = {
  Query: {
    searchUser: () => {
      return [
        {
          id: "1",
          username: "test",
        },
      ];
    },
  },
  Mutation: {
    createUser: async (
      _: any,
      args: { username: string },
      context: GraphQLContext
    ): Promise<CreateUserNameResponse> => {
      const { username } = args;
      const { session, prisma } = context;

      if (!session?.user) {
        return new Promise((res) => res({ error: "Not authenticated" }));
      }

      const { id: user_id } = session.user;

      console.log("Session user id: ", user_id);
      console.log("Session: ", session);

      try {
        // Check that username is unique
        const existingUser = await prisma.user.findUnique({
          where: {
            username,
          },
        });

        if (existingUser) {
          return { error: "Username already exists" };
        }

        // Update user
        await prisma.user.update({
          where: {
            id: user_id,
          },
          data: {
            username,
          },
        });

        return { success: true };
      } catch (error: any) {
        console.log("Error creating user", error);
        return {
          error: error?.message,
        };
      }
    },
  },
  Subscription: {},
};

export default resolvers;
