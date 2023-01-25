import { Account, EventCallbacks, Profile, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { AdapterUser } from 'next-auth/adapters';

const signIn = async (message: {
  user: User;
  account: Account | null;
  profile?: Profile | undefined;
  isNewUser?: boolean | undefined;
}) => {
  /* on successful sign in */
  console.debug('A user signed in', message);
};

const signOut = async (message: { session: Session; token: JWT }) => {
  /* on signout */
  console.debug('A user signed out', message);
};

const createUser = async (message: { user: User }) => {
  /* user created */
  console.debug('A new user was created:', message);
};

const updateUser = async (message: { user: User }) => {
  /* user updated - e.g. their email was verified */
  console.debug('A user was updated:', message);
};

const linkAccount = async (message: {
  user: User | AdapterUser;
  account: Account;
  profile: User | AdapterUser;
}) => {
  /* account (e.g. Twitter) linked to a user */
  console.debug('An account was linked to a user:', message);
};

const session = async (message: { session: Session; token: JWT }) => {
  /* session is active */
  console.debug('A session was updated:', message);
};

export const eventCallbacks: Partial<EventCallbacks> = {
  signIn,
  signOut,
  createUser,
  updateUser,
  linkAccount,
  session,
};
