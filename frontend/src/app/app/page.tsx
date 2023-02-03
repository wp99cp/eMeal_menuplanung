'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import TourPopup from '@/components/elements/TourPopop';
import { useRef } from 'react';

export default function Page() {

  const ref = useRef<HTMLDivElement>(null);


  return (
    <>
      <div ref={ref}>
        <h1>Hello, App Page!</h1>
        <br />
        <Link href='/'>Home</Link>
        <br />

        <Link href='/app/dashboard'>Dashboard</Link>
        <br />

        <button onClick={() => signOut()}>SignOut</button>
      </div>

      <TourPopup over={ref} />

    </>


  );
}
