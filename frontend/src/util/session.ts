/*
 * To prevent this sort of unintended client usage of server code, we can use the server-only package to give other
 * developers a build-time error if they ever accidentally import one of these modules into a Client Component.
 */
import 'server-only';

import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export async function getSession() {
  return await unstable_getServerSession(authOptions);
}

export async function getUser() {
  const session = await getSession();

  return session?.user;
}
