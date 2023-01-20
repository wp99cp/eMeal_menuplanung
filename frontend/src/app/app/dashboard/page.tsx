'use client';

import { useSession } from 'next-auth/react';

export default function Page() {
  const session = useSession();

  return (
    <>
      <h1>Hello, App Dashboatd Page!</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </>
  );
}
