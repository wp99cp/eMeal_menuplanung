import { OAuthConfig } from 'next-auth/providers';
import GoogleProvider, { GoogleProfile } from 'next-auth/providers/google';
import { User } from 'next-auth';

interface HitobitoProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  nickname: string;
}

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

export const GoogleProviderWithCustomProfile: OAuthConfig<GoogleProfile> =
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    httpOptions: {
      timeout: 10_000,
    },
    profile(profile: GoogleProfile): User {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        username: profile.sub,
        image: profile.picture,
        emailVerified: null,
        shareEmail: false,
      };
    },
  });
