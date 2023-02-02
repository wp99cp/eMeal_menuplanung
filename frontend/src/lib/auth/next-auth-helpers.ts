import { OAuthConfig } from 'next-auth/providers';
import GoogleProvider, { GoogleProfile } from 'next-auth/providers/google';
import { CallbacksOptions, SessionOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Account, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import Cookies from 'cookies';
import { decode, encode, JWTOptions } from 'next-auth/jwt';
import { HitobitoProfile } from '@/util/types/next-auth';

const prisma = new PrismaClient();

export const CeviDBProvider: OAuthConfig<HitobitoProfile> = {
  id: 'cevi-db',
  name: 'CeviDB',
  authorization: {
    url: process.env.CEVI_DB_INSTANCE_URI + '/oauth/authorize',
    params: {
      response_type: 'code',
      scope: 'name',
    },
  },
  token: {
    url: process.env.CEVI_DB_INSTANCE_URI + '/oauth/token',
    params: {
      grant_type: 'authorization_code',
      scope: 'name',
    },
  },

  // This custom is used as soon as we would like to use a scope different from 'email'.
  // As Hitobito uses the 'X-Scopes' header to pass the scopes, and not the 'scope' parameter,
  userinfo: {
    async request({ tokens }) {
      const url = process.env.CEVI_DB_INSTANCE_URI + '/oauth/profile';
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          'X-Scope': 'name',
        },
      });
      return await response.json();
    },
  },

  type: 'oauth',
  version: '2.0',
  httpOptions: {
    timeout: 10_000,
  },

  profile(profile: any): User {
    return {
      id: profile.id,
      name: profile.first_name + ' ' + profile.last_name,
      email: profile.email,
      username: profile.email,
      image: null,
      emailVerified: null,
      shareEmail: false,
      newUser: true,
    };
  },
  clientId: process.env.CEVI_DB_CLIENT_ID as string,
  clientSecret: process.env.CEVI_DB_CLIENT_SECRET as string,
  allowDangerousEmailAccountLinking: false,
};

export const MiDataProvider: any = {
  id: 'mi-data',
  name: 'MiData',
  type: 'oauth',
  version: '2.0',
  state: true,
  params: { grant_type: 'authorization_code' },
  idToken: true,
  authorizationUrl: process.env.CEVI_DB_INSTANCE_URI + '/oauth/authorize',
  accessTokenUrl: process.env.CEVI_DB_INSTANCE_URI + '/oauth/token',
  requestTokenUrl: process.env.CEVI_DB_INSTANCE_URI + '/oauth/profile',
  clientId: process.env.CEVI_DB_CLIENT_ID,
  clientSecret: process.env.CEVI_DB_CLIENT_SECRET,
};

export const GoogleProviderWithCustomProfile: OAuthConfig<GoogleProfile> = GoogleProvider(
  {
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    httpOptions: {
      timeout: 10_000,
    },
    allowDangerousEmailAccountLinking: true,
    profile(profile: GoogleProfile): User {
      return {
        newUser: true,
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        username: profile.sub,
        image: profile.picture,
        emailVerified: null,
        shareEmail: false,
      };
    },
  }
);

export const sessionSettings: Partial<SessionOptions> & { maxAge: number } = {
  strategy: 'database',

  // Seconds - How long until an idle session expires and is no longer valid.
  maxAge: 30 * 24 * 60 * 60, // 30 days

  // Seconds - Throttle how frequently to write to database to extend a session.
  // Use it to limit write operations. Set to 0 to always update the database.
  // Note: This option is ignored if using JSON Web Tokens
  updateAge: 24 * 60 * 60, // 24 hours
};

export const getCallbacksOptions = (
  req: NextApiRequest,
  res: NextApiResponse
): Partial<CallbacksOptions> => ({
  // based on https://github.com/nextauthjs/next-auth/discussions/4394#discussioncomment-3293618
  async signIn({ user }) {
    // Check if this sign in callback is being called in the credentials authentication flow.
    // If so, use we need to manually create a session for the user using Prisma.
    // Note: SignIn is called after authorize, so we can safely assume the user
    // is valid and already authenticated).
    if (
      req.query.nextauth?.includes('callback') &&
      req.query.nextauth.includes('credentials') &&
      req.method === 'POST' &&
      user
    ) {
      const fromDate = (time: number, date = Date.now()) => {
        return new Date(date + time * 1000);
      };

      const sessionToken = randomUUID();
      const sessionExpiry = fromDate(sessionSettings.maxAge);

      await prisma.session.create({
        data: {
          sessionToken: sessionToken,
          userId: user.id,
          expires: sessionExpiry,
        },
      });

      const cookies = new Cookies(req, res);

      cookies.set('next-auth.session-token', sessionToken, {
        expires: sessionExpiry,
      });
    }

    return true;
  },

  async session({ session, user }) {
    const sessionUser = { ...session.user, ...user };
    return Promise.resolve({
      ...session,
      user: sessionUser,
    });
  },
});

export const getJwtOptions = (
  req: NextApiRequest,
  res: NextApiResponse
): Partial<JWTOptions> => ({
  encode: async ({ token, secret, maxAge }) => {
    if (
      req.query.nextauth!.includes('callback') &&
      req.query.nextauth!.includes('credentials') &&
      req.method === 'POST'
    ) {
      const cookies = new Cookies(req, res);
      const cookie = cookies.get('next-auth.session-token');

      if (cookie) return cookie;
      else return '';
    }
    // Revert to default behaviour when not in the credentials provider callback flow
    return encode({ token, secret, maxAge });
  },
  decode: async ({ token, secret }) => {
    if (
      req.query.nextauth!.includes('callback') &&
      req.query.nextauth!.includes('credentials') &&
      req.method === 'POST'
    ) {
      return null;
    }

    // Revert to default behaviour when not in the credentials provider callback flow
    return decode({ token, secret });
  },
});

export const NextAuthCredentialProvider = CredentialsProvider({
  name: 'Credentials',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    const account_email = credentials?.email as string;
    const account_password = credentials?.password as string;
    if (!account_email || !account_password) return null;

    // lookup the user in the account database
    const account: Account | null = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'email',
          providerAccountId: account_email,
        },
      },
    });

    if (!account?.password) return null;

    // Check if password is correct
    const isCorrectPassword = bcrypt.compareSync(account_password, account?.password);
    if (!isCorrectPassword) return null;

    return prisma.user.findUnique({ where: { id: account.userId } });
  },
});
