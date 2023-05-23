import { Acknowledgement } from '@/util/generated/types/graphql';
import { GraphQLContext } from '@/util/types/types';
import { User } from '@prisma/client';

export function verifyPassword(password: string): Acknowledgement {
  // minimum password length
  if (password.length < 8)
    return { success: false, error: 'Password must be at least 8 characters long' };

  // maximum password length
  if (password.length > 100)
    return { success: false, error: 'Password must be less than 100 characters long' };

  // password must contain at least one lowercase letter
  if (!/[a-z]/.test(password))
    return {
      success: false,
      error: 'Password must contain at least one lowercase letter',
    };

  // password must contain at least one uppercase letter
  if (!/[A-Z]/.test(password))
    return {
      success: false,
      error: 'Password must contain at least one uppercase letter',
    };

  // password must contain at least one number
  if (!/[0-9]/.test(password))
    return { success: false, error: 'Password must contain at least one number' };

  return { success: true };
}

export const isUsernameUnique = async (
  username: string | undefined,
  ctx: GraphQLContext
) => {
  if (!username) return false;
  if (!ctx?.user_id) return false;

  const existingUser: User | null = await ctx.prisma.user.findUnique({
    where: {
      username,
    },
  });
  if (existingUser?.id === ctx.user_id) return true;
  return !existingUser;
};
