'use client';

import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const NewUser: NextPage = () => {
  const session = useSession();

  return (
    <>
      <h1>Welcome {session.data?.user.username}!</h1>

      <p>On this page you can change your username!</p>
      <Link href="/app">Weiter zur App</Link>
    </>
  );
};

export default NewUser;
