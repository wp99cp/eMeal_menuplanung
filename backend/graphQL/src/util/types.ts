import { ISODateString } from "next-auth";
import { PrismaClient } from "@prisma/client";

export interface GraphQLContext {
  session: Session | null;
  prisma: PrismaClient;
  // pubsub
}

/**
 * Users
 */

export interface Session {
  user?: User;
  expires: ISODateString;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  shareEmail: boolean;
  image: string | null;
  username: string | null;
  emailVerified: Date | null;
}

export interface UpdateUserResponse {
  success: boolean;
  error?: string;
}
