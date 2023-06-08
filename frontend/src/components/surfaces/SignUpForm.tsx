'use client';

import Image from 'next/image';
import logo from '@/assets/logo.svg';
import { TextLink } from '@/components/elements/TextLink';
import SignInOptions from '@ui/elements/SignInOptions';
import TextInput, {
  InputFieldDefaultState,
  InputFieldState,
} from '@/components/inputs/TextInput';
import Checkbox from '@/components/inputs/Checkbox';
import { Card, CardState, DefaultCardState } from '@/components/layout/Card';
import { LoadingSpinner } from '@/components/surfaces/LoadingSpinner';
import { FormEvent, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import {
  CreateNewUserDocument,
  CreateNewUserMutation,
  CreateNewUserMutationVariables,
} from '@/util/generated/graphql/graphql';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@ui/components/Button';
import { Divider } from '@ui/components/Divider';

export default function SignUpForm() {
  const router = useRouter();

  const [cardState, setCardState] = useState<CardState>(DefaultCardState);

  const [email, setEmail] = useState('');
  const [emailState, setEmailState] = useState<InputFieldState>(InputFieldDefaultState);

  const [name, setName] = useState('');

  const [password, setPassword] = useState('');
  const [passwordState, setPasswordState] =
    useState<InputFieldState>(InputFieldDefaultState);

  const graphql = useApolloClient();

  const register = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCardState('loading');

    const res = await graphql.mutate<
      CreateNewUserMutation,
      CreateNewUserMutationVariables
    >({
      mutation: CreateNewUserDocument,
      variables: {
        email,
        name,
        password,
      },
    });

    console.log(res);

    if (!res?.data?.createNewUser?.success) {
      setCardState(DefaultCardState);

      if (res?.data?.createNewUser?.error?.includes('email')) {
        setEmailState([
          'error',
          res?.data?.createNewUser?.error || 'Email bereits registriert',
        ]);
      } else {
        setPasswordState([
          'error',
          res?.data?.createNewUser?.error || 'Unbekannter Fehler',
        ]);
      }
    } else {
      // User successfully registered
      // forwards to /app
      router.push('/app');
    }
  };

  return (
    <>
      <div className="flex min-h-full w-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Image
              className="mx-auto hidden h-12 w-auto sm:flex"
              src={logo}
              alt="Cevi.Tools Logo"
            />

            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Neuer Account erstellen
            </h2>

            <p className="text-center text-gray-600">
              <TextLink href="/auth/signin"> Bestehenden Account</TextLink> verwenden.
            </p>
          </div>

          <Card
            cardStateHook={[cardState, setCardState]}
            loadingScreen={<LoadingSpinner />}
          >
            <h3 className="my-6 block text-center text-lg font-bold text-gray-500">
              Neuer Account erstellen
            </h3>

            <div className="my-6">
              <form className="space-y-6" onSubmit={register}>
                <div>
                  <TextInput
                    id="email"
                    name="email"
                    description="E-Mail-Adresse"
                    type="email"
                    autoComplete="email"
                    stateHook={[email, setEmail]}
                    fieldState={[emailState, setEmailState]}
                    required
                  />

                  <TextInput
                    id="name"
                    name="name"
                    description="Name"
                    type="name"
                    autoComplete="name"
                    stateHook={[name, setName]}
                    required
                  />

                  <TextInput
                    id="password"
                    name="password"
                    description="Passwort"
                    type="password"
                    stateHook={[password, setPassword]}
                    fieldState={[passwordState, setPasswordState]}
                    autoComplete="current-password"
                    required
                  />

                  <Checkbox
                    id="accept-agbs"
                    name="accept-agbs"
                    description="Ich akzeptiere die Datenschutzbestimmungen."
                    required
                  />
                </div>

                <Button intent="primary" className="flex w-full justify-center">
                  Registrieren
                </Button>
              </form>
            </div>

            <Divider>oder anmelden mit</Divider>

            <SignInOptions
              signInHandler={async (provider) => {
                setCardState('loading');
                await signIn(provider);
              }}
            />
          </Card>
        </div>
      </div>
    </>
  );
}
