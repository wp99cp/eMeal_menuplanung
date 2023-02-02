import { isValidUsername } from '@/util/functions';
import { MutationResolvers, QueryResolvers } from '@/util/generated/types/graphql';
import * as console from 'console';
import bcrypt from 'bcryptjs';

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

  createNewUser: async (_, args, context) => {
    const { name, email, password } = args;
    const { prisma } = context;

    if (!name) return { success: false, error: 'Name is required' };
    if (!email) return { success: false, error: 'Email is required' };
    if (!password) return { success: false, error: 'Password is required' };

    try {
      // Check if user with that email already exists
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) return { success: false, error: 'User already exists' };

      const account = await prisma.account.create({
        data: {
          user: {
            create: {
              name,
              email,
              username: email,
              shareEmail: false,
              newUser: true,
            },
          },
          type: 'credentials',
          provider: 'email',
          providerAccountId: email,
          password: bcrypt.hashSync(password, 10),
        },
      });

      if (!account) return { success: false, error: 'Account not created' };
    } catch (error: any) {
      return { success: false, error: error?.message };
    }

    return { success: true };
  },
};
