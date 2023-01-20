'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function Page() {
  return (
    <>
      <h1>Hello, App Page!</h1>
      <br />
      <Link href="/">Home</Link>
      <br />

      <Link href="/app/dashboard">Dashboard</Link>
      <br />

      <button onClick={() => signOut()}>SignOut</button>
    </>
  );
}
