import TextInput, {
  FieldState,
  InputFieldLoadingState,
  InputFieldState,
} from '@/components/inputs/TextInput';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { GraphQLClient } from '@/graphql/apollo-client';
import { useApolloClient } from '@apollo/client';
import {
  CheckUsernameDocument,
  CheckUsernameQuery,
  CheckUsernameQueryVariables,
} from '@/util/generated/graphql/graphql';

export interface UsernameInputFieldProps {
  usernameHook: [string, Dispatch<SetStateAction<string>>];
}

const validateUsername = async (
  graphql: GraphQLClient,
  setUsernameState: Dispatch<SetStateAction<InputFieldState>>,
  username: string
) => {
  setUsernameState(['loading', '']);

  let clientError = '';

  // A username must be between 5 and 20 characters long
  // and can only contain letters, numbers, underscores, and hyphens
  if (username === '') {
    setUsernameState(['error', 'Der Benutzername darf nicht leer sein']);
    return;
  }

  if (username.length < 5) {
    clientError = 'Benutzername ist zu kurz';
  }
  if (username.length > 20) {
    clientError = 'Benutzername ist zu lang';
  }
  if (!/^[a-zA-Z0-9_-]*$/.test(username)) {
    clientError = 'Benutzername enthält ungültige Zeichen.';
  }

  if (clientError || !graphql) {
    setUsernameState(['error', clientError]);
    return;
  }

  const res = await graphql.query<CheckUsernameQuery, CheckUsernameQueryVariables>({
    query: CheckUsernameDocument,
    variables: { username },
  });

  let status: FieldState = 'default';

  if (res.data?.checkUsername?.success) {
    status = 'success';
  } else if (!res.data?.checkUsername?.success) {
    status = 'error';
  }

  setUsernameState([status, 'Benutzername ist ungültig oder nicht mehr verfügbar']);
};

const UsernameInputField = ({
  usernameHook: [username, setUsername],
}: UsernameInputFieldProps) => {
  const graphql = useApolloClient();

  const [usernameState, setUsernameState] =
    useState<InputFieldState>(InputFieldLoadingState);

  // Validate the username on every change
  useEffect(() => {
    (async () => {
      await validateUsername(graphql, setUsernameState, username);
    })().catch(console.error);
  }, [username]);

  return (
    <TextInput
      id="username"
      name="username"
      type="text"
      stateHook={[username, setUsername]}
      prefix="@"
      fieldState={[usernameState, setUsernameState]}
      description="Benutzername"
    />
  );
};

export default UsernameInputField;
