import { PrismaClient } from '@prisma/client';
import { User } from 'next-auth';

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
