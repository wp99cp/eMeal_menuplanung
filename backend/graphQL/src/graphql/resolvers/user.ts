import { isValidUsername } from '@/util/functions';
import { MutationResolvers, QueryResolvers } from '@/util/generated/types/graphql';
import * as console from 'console';

export const userQueries: QueryResolvers = {
  checkUsername: async (_, args, context) => {
    const { username } = args;
    const { session, prisma } = context;

    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { id: user_id } = session.user;

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
    const { username, shareEmail } = args;
    const { session, prisma } = context;

    console.log('updateUser', args);

    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { id: user_id } = session.user;

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
          ...(shareEmail !== undefined && {
            shareEmail: shareEmail?.valueOf(),
          }),
        },
      });
    } catch (error: any) {
      console.log('Error creating user', error);
      return { success: false, error: error?.message };
    }

    return { success: true };
  },
};
