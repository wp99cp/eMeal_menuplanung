import { OAuthConfig } from 'next-auth/providers';
import GoogleProvider, { GoogleProfile } from 'next-auth/providers/google';

export const CeviDBProvider: any = {
  id: 'cevi-db',
  name: 'CeviDB',
  type: 'oauth',
  version: '2.0',
  state: true,
  params: { grant_type: 'authorization_code' },
  idToken: true,
  authorizationUrl:
    process.env.CEVI_DB_INSTANCE_URI + '/oauth/authorize?response_type=code',
  accessTokenUrl: process.env.CEVI_DB_INSTANCE_URI + '/oauth/token',
  requestTokenUrl: process.env.CEVI_DB_INSTANCE_URI + '/oauth/profile',
  clientId: process.env.CEVI_DB_CLIENT_ID,
  clientSecret: process.env.CEVI_DB_CLIENT_SECRET,
};

export const MiDataProvider: any = {
  id: 'mi-data',
  name: 'MiData',
  type: 'oauth',
  version: '2.0',
  state: true,
  params: { grant_type: 'authorization_code' },
  idToken: true,
  authorizationUrl:
    process.env.CEVI_DB_INSTANCE_URI + '/oauth/authorize?response_type=code',
  accessTokenUrl: process.env.CEVI_DB_INSTANCE_URI + '/oauth/token',
  requestTokenUrl: process.env.CEVI_DB_INSTANCE_URI + '/oauth/profile',
  clientId: process.env.CEVI_DB_CLIENT_ID,
  clientSecret: process.env.CEVI_DB_CLIENT_SECRET,
};

export const GoogleProviderWithCustomProfile: OAuthConfig<GoogleProfile> =
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    httpOptions: {
      timeout: 10_000,
    },
    profile(profile: GoogleProfile): any {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        username: profile.sub,
        image: profile.picture,
        emailVerified: profile.email_verified,
      };
    },
  });
