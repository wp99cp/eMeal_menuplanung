import { isValidUsername } from '@/util/functions';
import { MutationResolvers, QueryResolvers } from '@/util/generated/types/graphql';
import * as console from 'console';

export const userQueries: QueryResolvers = {
  checkUsername: async (_, args, context) => {
    const { username } = args;
    const { user_id, prisma } = context;

    if (!user_id)
      return { success: false, error: 'No user_id set. Are you using a api key?' };

    if (!username) {
      return {
        success: false,
        error: 'Username is required',
      };
    }

    try {
      if (!(await isValidUsername(prisma, username, user_id))) {
        return {
          success: false,
          error: 'Username already exists or is invalid',
        };
      }
    } catch (error: any) {
      console.log('Error checking username', error);
      return { success: false, error: error?.message };
    }

    return { success: true };
  },
};

export const userMutations: MutationResolvers = {
  updateUser: async (_, args, context) => {
    const { username, shareEmail, newUser } = args;
    const { user_id, prisma } = context;

    if (!user_id)
      return { success: false, error: 'No user_id set. Are you using a api key?' };

    if (!username) {
      return {
        success: false,
        error: 'Username is required',
      };
    }

    try {
      if (!(await isValidUsername(prisma, username, user_id))) {
        return {
          success: false,
          error: 'Username already exists or is invalid',
        };
      }

      // Update user
      await prisma.user.update({
        where: {
          id: user_id,
        },
        data: {
          username,
          ...(shareEmail !== undefined && { shareEmail: shareEmail?.valueOf() }),
          ...(newUser !== undefined && { newUser: newUser?.valueOf() }),
        },
      });
    } catch (error: any) {
      return { success: false, error: error?.message };
    }

    return { success: true };
  },
};
