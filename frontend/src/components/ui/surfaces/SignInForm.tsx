'use client';

import { TextLink } from '@/components/elements/TextLink';
import TextInput, {
  InputFieldDefaultState,
  InputFieldState,
} from '@/components/inputs/TextInput';
import Checkbox from '@/components/inputs/Checkbox';
import SignInOptions from '@ui/elements/SignInOptions';
import { useSearchParams } from 'next/navigation';
import { Card, CardState, DefaultCardState } from '@/components/layout/Card';
import { FormEvent, useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/surfaces/LoadingSpinner';
import { signIn } from 'next-auth/react';
import { Button } from '@ui/components/Button';
import { Divider } from '@ui/components/Divider';
import { Provider } from '@/util/types/next-auth';

export default function SignInForm() {
  const readOnlySearchParams = useSearchParams();

  const initialFieldState: InputFieldState = ['error', 'E-Mail oder Passwort falsch.'];
  const [pwdFieldState, setPwdFieldState] = useState(initialFieldState);
  const [email, setEmail] = useState(readOnlySearchParams?.get('email') || '');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (pwdFieldState[0] === 'error' && password.length !== 0)
      setPwdFieldState(InputFieldDefaultState);
  }, [password, pwdFieldState]);

  const [cardState, setCardState] = useState<CardState>(DefaultCardState);

  const signInFunction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCardState('loading');

    console.log('signInFunction');

    // removeQueryParam('error');

    await signIn(Provider.CREDENTIALS, {
      redirect: true,
      email,
      password,
    });
  };

  return (
    <>
      <Card cardStateHook={[cardState, setCardState]} loadingScreen={<LoadingSpinner />}>
        <h3 className="my-6 block text-center text-lg font-bold text-gray-500">
          Anmelden mit
        </h3>

        <SignInOptions
          signInHandler={async (provider) => {
            setCardState('loading');
            await signIn(provider);
          }}
        />

        <Divider> oder mit Benutzername und Passwort </Divider>

        <div className="my-6">
          <form className="space-y-6" onSubmit={signInFunction}>
            <div>
              <TextInput
                id="email"
                name="email"
                description="E-Mail-Adresse"
                type="email"
                autoComplete="email"
                stateHook={[email, setEmail]}
                required
              />
              <TextInput
                id="password"
                name="password"
                description="Passwort"
                type="password"
                autoComplete="current-password"
                stateHook={[password, setPassword]}
                fieldState={[pwdFieldState, setPwdFieldState]}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <Checkbox
                id="remember-me"
                name="remember-me"
                description="Angemeldet bleiben"
              />

              <div className="text-sm">
                <TextLink href="/auth/forgot-password">Passwort vergessen?</TextLink>
              </div>
            </div>

            <Button intent="primary" fullWidth>
              Anmelden
            </Button>
          </form>
        </div>
      </Card>
    </>
  );
}
