import { GraphQLContext, UpdateUserResponse } from "../../util/types";
import { isValidUsername } from "../../util/functions";

let resolvers = {
  Query: {
    checkUsername: async (
      _: any,
      args: { username: string },
      context: GraphQLContext
    ): Promise<UpdateUserResponse> => {
      const { username } = args;
      const { session, prisma } = context;

      if (!session?.user) {
        return { success: false, error: "Not authenticated" };
      }

      const { id: user_id } = session.user;

      try {
        if (!(await isValidUsername(prisma, username, user_id))) {
          return {
            success: false,
            error: "Username already exists or is invalid",
          };
        }
      } catch (error: any) {
        console.log("Error checking username", error);
        return {
          success: false,
          error: error?.message,
        };
      }

      return { success: true };
    },
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
    updateUser: async (
      _: any,
      args: { username: string; shareEmail: boolean },
      context: GraphQLContext
    ): Promise<UpdateUserResponse> => {
      const { username } = args;
      const { session, prisma } = context;

      if (!session?.user) {
        return { success: false, error: "Not authenticated" };
      }

      const { id: user_id } = session.user;

      try {
        if (!(await isValidUsername(prisma, username, user_id))) {
          return {
            success: false,
            error: "Username already exists or is invalid",
          };
        }

        // Update user
        await prisma.user.update({
          where: {
            id: user_id,
          },
          data: {
            username,
            shareEmail: args.shareEmail,
          },
        });
        return { success: true };
      } catch (error: any) {
        console.log("Error creating user", error);
        return {
          success: false,
          error: error?.message,
        };
      }
    },
  },
  Subscription: {},
};

export default resolvers;
