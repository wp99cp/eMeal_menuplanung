'use client';

import { signIn } from 'next-auth/react';
import React from 'react';

const LoginPage = () => {
  return (
    <>
      <h1>Sign In</h1>
      <button onClick={() => signIn('google')}>Sign In</button>
    </>
  );
};
export default LoginPage;
