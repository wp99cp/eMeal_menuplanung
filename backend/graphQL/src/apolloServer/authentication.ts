import { ExpressContextFunctionArgument } from '@apollo/server/express4';
import { Session } from '@/util/types/types';
import { IncomingHttpHeaders } from 'http';
import logger from '@/logger/logger';
import { PrismaClient, SubscriptionContext } from '@/apolloServer/context';

/**
 * Checks if the request is authenticated using an API token.
 * It verifies if the provided `api_token` matches the expected API key.
 *
 * @param api_token - The API token provided in the request header.
 * @returns A boolean indicating whether the request is authenticated using an API token.
 */
export const isAuthenticatedUsingAPIToken = (api_token: string | undefined): boolean => {
  // If the `api_token` is not provided, the request is not authenticated
  if (!api_token) return false;

  // If the `api_token` is provided, we check if it matches the expected API key
  return api_token === (process.env.GRAPHQL_API_KEY as string);
};

/**
 *
 * Retrieves the session by making a request to the internal NextAuth session API
 * This API is exposed by the frontend (i.g. by NextAuth running within NextJS).
 *
 * @param req - The Express request object containing the headers.
 * @param prisma - The Prisma client instance.
 * @returns A promise that resolves to the Session object.
 *
 */
export const retrieveSession = async (
  req: ExpressContextFunctionArgument['req'] | SubscriptionContext['connectionParams'],
  prisma: PrismaClient
): Promise<Session | null> => {
  // case ExpressContextFunctionArgument['req']
  if ('headers' in req) {
    return fetch(`${process.env.NEXTAUTH_URL_INTERNAL}/api/auth/session`, {
      headers: { cookie: req.headers.cookie as string },
    })
      .then((res) => (res.ok ? res.json() : null))
      .catch((err) => {
        logger.error(`Error retrieving session: ${err.toString()}`);
        return null;
      });
  }

  // case SubscriptionContext['connectionParams']

  const session_token = req.session_token?.toString() || '';

  const db_lookup = await prisma.session.findUnique({
    where: {
      sessionToken: session_token,
    },
    include: {
      user: true,
    },
  });

  if (!db_lookup) {
    return null;
  }

  return {
    user: db_lookup?.user || null,
  } satisfies Session;
};

/**
 *
 * Retrieves the user ID based on the session, API key validity, and connection parameters.
 *
 * @param session - The session object containing user information.
 * @param has_valid_api_key - A boolean indicating whether the API key is valid.
 * @param params - The connection parameters object.
 *
 * @returns The user ID as a string.
 *
 */
export const getUserId = (
  session: Session | undefined | null,
  has_valid_api_key: boolean,
  params: IncomingHttpHeaders | SubscriptionContext['connectionParams']
) => {
  return (
    session?.user?.id || (has_valid_api_key && (params?.['x-user-id'] as string)) || ''
  );
};
