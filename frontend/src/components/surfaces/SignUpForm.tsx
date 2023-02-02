'use client';

import Image from 'next/image';
import logo from '@/assets/logo.svg';
import { TextLink } from '@/components/elements/TextLink';
import { PrimaryButton } from '@/components/elements/Buttons/PrimaryButton';
import SignInOptions from '@/components/elements/SignInOptions';
import { NamedDivider } from '@/components/elements/Divider/NamedDivider';
import TextInput from '@/components/inputs/TextInput';
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

export default function SignUpForm() {
  const [cardState, setCardState] = useState<CardState>(DefaultCardState);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

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
  };

  return (
    <>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Image
              className="mx-auto h-12 w-auto hidden sm:flex"
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
            <h3 className="block text-lg font-bold text-gray-500 my-6 text-center">
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
                    autoComplete="current-password"
                    required
                  />

                  <Checkbox
                    id="accept-agbs"
                    name="accept-agbs"
                    description="Ich akzeptiere die AGB und Datenschutzbestimmungen."
                  />
                </div>

                <PrimaryButton className="flex w-full justify-center">
                  Registrieren
                </PrimaryButton>
              </form>
            </div>

            <NamedDivider text="oder anmelden mit" />

            <SignInOptions onClick={() => setCardState('loading')} />
          </Card>
        </div>
      </div>
    </>
  );
}
