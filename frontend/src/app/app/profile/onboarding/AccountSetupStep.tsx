import { StepperCardArgs } from '@/app/app/profile/onboarding/page';
import Checkbox from '@/components/inputs/Checkbox';
import UsernameInputField from '@/components/inputs/customFields/UsernameInputField';
import {
  UpdateUserDocument,
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from '@/util/generated/graphql/graphql';

export const AccountSetupStepAction: (
  args: StepperCardArgs
) => boolean | Promise<boolean> = async ({ graphql, usernameHook, shareEmailHook }) => {
  const [username] = usernameHook;
  const [shareEmail] = shareEmailHook;

  // Update the user's username and share_email field in the database
  const res = await graphql.mutate<UpdateUserMutation, UpdateUserMutationVariables>({
    mutation: UpdateUserDocument,
    variables: { username, shareEmail: shareEmail },
  });

  return !!res.data?.updateUser?.success;
};

export const AccountSetupStepContent: (args: StepperCardArgs) => JSX.Element = ({
  usernameHook,
  shareEmailHook,
}) => {
  return (
    <>
      <p className="mb-2 mt-8 font-bold text-accent-500">Account Vervollständigen</p>
      <p className="mb-4 text-2xl font-bold">Einrichten deines Accounts</p>
      <p className="mb-4 text-gray-500">
        Wähle einen Benutzername. Dieser wird allen Nutzern angezeigt, so dass sie Lager
        und Rezepte mit dir teilen können.
      </p>
      <UsernameInputField usernameHook={usernameHook}></UsernameInputField>
      <p className="my-4 text-gray-500">
        Damit andere dich einfacher finden können, verwenden wir zusätzlich deine E-Mail
        Adresse. Möchtest du, dass andere Nutzer deine E-Mail Adresse sehen können?
      </p>
      <Checkbox
        id="share-mail"
        name="share-mail"
        stateHook={shareEmailHook}
        description="E-Mail-Adresse zusammen mit Nickname anzeigen"
      />
    </>
  );
};
