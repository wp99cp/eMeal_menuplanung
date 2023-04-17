'use client';

import StepperCard, {
  StepperCardSettings,
  StepperCardSteps,
} from '@/components/layout/StepperCard';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { GraphQLClient } from '@/graphql/apollo-client';
import { useApolloClient } from '@apollo/client';
import {
  WelcomeStepAction,
  WelcomeStepContent,
} from '@/app/app/profile/onboarding/WelcomStep';
import {
  AccountSetupStepAction,
  AccountSetupStepContent,
} from '@/app/app/profile/onboarding/AccountSetupStep';
import {
  MigrationStepAction,
  MigrationStepContent,
} from '@/app/app/profile/onboarding/MigrationStep';
import {
  UpdateUserDocument,
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from '@/util/generated/graphql/graphql';

export interface StepperCardArgs {
  usernameHook: [string, Dispatch<SetStateAction<string>>];
  shareEmailHook: [boolean, Dispatch<SetStateAction<boolean>>];
  graphql: GraphQLClient;
}

const getDefaultUsername = (session: Session | null): string => {
  let username = session?.user?.email?.split('@')[0] || '';
  username = username.replace(/[^a-zA-Z0-9_-]/g, '');

  if (username.length > 20) {
    username = username.substring(0, 20);
  } else if (username.length < 5) {
    username = '';
  }

  return username;
};

const OnboardingPage = () => {
  const graphql: GraphQLClient = useApolloClient();
  const { data: session } = useSession();

  const [username, setUsername] = useState<string>('');
  const shareEmailHook = useState<boolean>(true);

  // Once the session is loaded, set the default username
  useEffect(() => {
    const defaultUsername = getDefaultUsername(session);
    if (username == '') setUsername(defaultUsername);
  }, [session, username]);

  const settings: StepperCardSettings<StepperCardArgs> = {
    step_fnc_args: {
      graphql,
      usernameHook: [username, setUsername],
      shareEmailHook,
    },
    stepper_nav_config: {
      first_nav: {
        forwards_button_name: 'Account einrichten',
      },
      middle_nav: {
        backwards_button_name: 'Zurück',
        forwards_button_name: 'Weiter',
      },
      last_nav: {
        backwards_button_name: 'Zurück',
        forwards_button_name: 'Abschliessen',
        continuation_link: '/app',
      },
    },
  };
  const steps: StepperCardSteps<StepperCardArgs>[] = [
    {
      name: 'Willkommen bei eMeal',
      step_name: 'welcome',
      step_action: WelcomeStepAction,
      content: WelcomeStepContent,
    },
    {
      name: 'Account vervollständigen',
      step_name: 'account',
      step_action: AccountSetupStepAction,
      content: AccountSetupStepContent,
    },
    {
      name: 'Daten übernehmen',
      step_name: 'data-migration',
      step_action: MigrationStepAction,
      content: MigrationStepContent,
    },
    {
      name: 'Fertig',
      step_name: 'done',
      step_action: async () => {
        // Update the user's username and share_email field in the database
        const res = await graphql.mutate<UpdateUserMutation, UpdateUserMutationVariables>(
          {
            mutation: UpdateUserDocument,
            variables: { newUser: false },
          }
        );

        return !!res.data?.updateUser?.success;
      },
      content: () => (
        <>
          <p className="mb-2 mt-8 font-bold text-accent-500">
            Dein Konto ist eingerichtet!
          </p>
          <p className="mb-4 text-2xl font-bold">
            Herzlich willkommen bei eMeal - Menüplanung.
          </p>
          <p className="my-2 font-medium text-gray-600">
            Du kannst nun mit der Planung deines Lagers beginnen.
          </p>
        </>
      ),
    },
  ];

  return <StepperCard settings={settings} steps={steps} />;
};

export default OnboardingPage;
