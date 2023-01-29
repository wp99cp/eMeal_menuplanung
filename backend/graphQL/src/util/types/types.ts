import { PrismaClient } from '@prisma/client';
import { User } from '@/util/generated/prisma/client';

export interface GraphQLContext {
  session: Session | null;
  prisma: PrismaClient;
  // pubsub
}

export interface UpdateUserResponse {
  success: boolean;
  error?: string;
}

export interface Session {
  user: User;
}
