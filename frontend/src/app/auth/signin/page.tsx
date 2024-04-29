'use client';

import React, { useEffect } from 'react';
import SignInForm from '@ui/surfaces/SignInForm';
import Alert from '@/components/elements/Notification/Alert';
import Image from 'next/image';
import logo from '@/assets/logo.svg';
import { TextLink } from '@/components/elements/TextLink';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const pathname = usePathname();
  const router = useRouter();

  const readOnlySearchParams = useSearchParams();
  const authErrorMgs: string | null = readOnlySearchParams?.get('error') || null;

  // remove cyclic callbackUrl
  const signInUrl = 'http://localhost:3000/auth/signin';
  useEffect(() => {
    if (readOnlySearchParams?.get('callbackUrl')?.startsWith(signInUrl))
      removeQueryParam('callbackUrl');
  });

  const removeQueryParam = (paramToRemove: string) => {
    const searchParams = new URLSearchParams(readOnlySearchParams?.toString());
    searchParams.delete(paramToRemove);
    router.replace(pathname + '?' + searchParams.toString());
  };

  return (
    <>
      {authErrorMgs === 'OAuthCallback' && (
        <Alert
          title="Anmeldung fehlgeschlagen"
          description="Das Login ist fehlgeschlagen, versuche es erneut oder wende dich an den Support."
          type="error"
          onClose={() => removeQueryParam('error')}
        />
      )}
      {authErrorMgs === 'OAuthSignin' && (
        <Alert
          title="Anmeldung fehlgeschlagen"
          description="Dieser Account wird zur Zeit (noch) nicht unterstützt. Melde dich mit einem anderen Account an."
          type="error"
          onClose={() => removeQueryParam('error')}
        />
      )}

      {authErrorMgs === 'OAuthAccountNotLinked' && (
        <Alert
          title="Anmeldung fehlgeschlagen"
          description="Du meldest dich normalerweise mit einem andern Account an. Bitte versuche es erneut."
          type="error"
          onClose={() => removeQueryParam('error')}
        />
      )}

      <div className="flex min-h-full w-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Image
              className="mx-auto hidden h-12 w-auto sm:flex"
              src={logo}
              alt="Cevi.Tools Logo"
            />

            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Anmelden und loslegen
            </h2>
            <p className="text-center text-gray-600">
              Oder ein <TextLink href="/auth/signup">neuer Account</TextLink> erstellen.
            </p>
          </div>

          <SignInForm />
        </div>
      </div>
    </>
  );
}
