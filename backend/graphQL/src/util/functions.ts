import { PrismaClient, User } from '@prisma/client';
import { Acknowledgement, MutationResolvers } from '@/util/generated/types/graphql';

export async function isValidUsername(
  prisma: PrismaClient,
  username: string,
  id: string
): Promise<boolean> {
  // A username must be between 5 and 20 characters long
  // and can only contain letters, numbers, underscores, and hyphens
  if (!/^[A-Za-z0-9_-]{5,20}$/.test(username)) {
    return false;
  }

  if (!username) return false;

  const existingUser: User | null = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (existingUser?.id === id) return true;

  return !existingUser;
}

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
