import NextAuth, { CallbacksOptions, NextAuthOptions } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import {
  CeviDBProvider,
  GoogleProviderWithCustomProfile,
} from '@/lib/auth/next-auth-providers';
import { eventCallbacks } from '@/lib/logging/next-auth';

const prisma = new PrismaClient();

const pages = {
  signIn: '/auth/signin',
  verifyRequest: '/auth/verify-request',
  newUser: '/auth/new-user',
};

const callbacks: Partial<CallbacksOptions> = {
  async signIn({}) {
    return true;
  },

  async session({ session, user }) {
    const sessionUser = { ...session.user, ...user };

    return Promise.resolve({
      ...session,
      user: sessionUser,
    });
  },
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [GoogleProviderWithCustomProfile, CeviDBProvider],
  secret: process.env.NEXTAUTH_SECRET,
  session: {},
  callbacks,
  pages,
  events: eventCallbacks,
};

export default NextAuth(authOptions);
