import NextAuth, { NextAuthOptions } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import {
  CeviDBProvider,
  getCallbacksOptions,
  GoogleProviderWithCustomProfile,
  MiDataProvider,
  NextAuthCredentialProvider,
  sessionSettings,
} from '@/lib/auth/next-auth-helpers';
import { eventCallbacks } from '@/lib/logging/next-auth';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProviderWithCustomProfile,
    CeviDBProvider,
    MiDataProvider,
    NextAuthCredentialProvider,
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: sessionSettings,
  pages: {
    signIn: '/auth/signin',
    signOut: '/',
    error: '/auth/signin',
    verifyRequest: '/auth/verify-request',
    newUser: '/app/profile/onboarding',
  },
  events: eventCallbacks,
};

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  authOptions.callbacks = getCallbacksOptions(req, res);
  return await NextAuth(req, res, authOptions);
}
