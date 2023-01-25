'use client';

import Image from 'next/image';
import logo from '@/assets/logo.svg';
import { TextLink } from '@/components/elements/TextLink';
import { PrimaryButton } from '@/components/elements/Buttons/PrimaryButton';
import TextInput from '@/components/inputs/TextInput';
import Checkbox from '@/components/inputs/Checkbox';
import SignInOptions from '@/components/elements/SignInOptions';
import { NamedDivider } from '@/components/elements/Divider/NamedDivider';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Alert from '@/components/elements/Notification/Alert';
import { Card, CardState, DefaultCardState } from '@/components/layout/Card';
import { useState } from 'react';
import { LoadingSpinner } from '@/components/surfaces/LoadingSpinner';

export default function SignInForm() {
  const readOnlySearchParams = useSearchParams();
  const hasOAuthError: string | null =
    readOnlySearchParams.get('error') || null;

  const pathname = usePathname();
  const router = useRouter();

  const removeQueryParam = (paramToRemove: string) => {
    const searchParams = new URLSearchParams(readOnlySearchParams.toString());
    searchParams.delete(paramToRemove);
    router.replace(pathname + '?' + searchParams.toString());
  };

  const [cardState, setCardState] = useState<CardState>(DefaultCardState);

  return (
    <>
      {hasOAuthError === 'OAuthCallback' && (
        <Alert
          title="Anmeldung fehlgeschlagen"
          description="Das Login ist fehlgeschlagen, versuche es erneut oder wende dich an den Support."
          type="error"
          onClose={() => removeQueryParam('error')}
        />
      )}
      {hasOAuthError === 'OAuthSignin' && (
        <Alert
          title="Anmeldung fehlgeschlagen"
          description="Dieser Account wird zur Zeit (noch) nicht unterstützt. Melde dich mit einem anderen Account an."
          type="error"
          onClose={() => removeQueryParam('error')}
        />
      )}

      {hasOAuthError === 'OAuthAccountNotLinked' && (
        <Alert
          title="Anmeldung fehlgeschlagen"
          description="Du meldest dich normalerweise mit einem andern Account an. Bitte versuche es erneut."
          type="error"
          onClose={() => removeQueryParam('error')}
        />
      )}

      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Image
              className="mx-auto h-12 w-auto hidden sm:flex"
              src={logo}
              alt="Cevi.Tools Logo"
            />

            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Anmelden und loslegen
            </h2>
            <p className="text-center text-gray-600">
              Oder ein <TextLink href="/auth/signup">neuer Account</TextLink>{' '}
              erstellen.
            </p>
          </div>
          <Card
            cardStateHook={[cardState, setCardState]}
            loadingScreen={<LoadingSpinner />}
          >
            <h3 className="block text-lg font-bold text-gray-500 my-6 text-center">
              Anmelden mit
            </h3>

            <SignInOptions onClick={() => setCardState('loading')} />

            <NamedDivider text="oder mit Benutzername und Passwort" />

            <div className="my-6">
              <form className="space-y-6">
                <TextInput
                  id="email"
                  name="email"
                  description="E-Mail-Adresse"
                  type="email"
                  autoComplete="email"
                  required
                />

                <TextInput
                  id="password"
                  name="password"
                  description="Passwort"
                  type="password"
                  autoComplete="current-password"
                  required
                />

                <div className="flex items-center justify-between">
                  <Checkbox
                    id="remember-me"
                    name="remember-me"
                    description="Angemeldet bleiben"
                  />

                  <div className="text-sm">
                    <TextLink href="/auth/forgot-password">
                      Passwort vergessen?
                    </TextLink>
                  </div>
                </div>

                <PrimaryButton className="flex w-full justify-center">
                  Anmelden
                </PrimaryButton>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
