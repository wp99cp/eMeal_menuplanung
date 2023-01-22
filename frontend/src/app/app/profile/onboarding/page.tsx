import { SmallLayout } from '@/components/layout/SmallLayout';
import { Text } from '@/components/basics/Text';
import { TextLink } from '@/components/basics/TextLink';

export default function OnboardingPage() {
  return (
    <>
      <SmallLayout>
        <Text>Onboarding for new users.</Text>
        <Text>- Import data from old eMeal</Text>
        <Text>- Complete the user profile</Text>
        <Text>
          - Starte Einführung, zum Dashboard oder weiter zur Callback-URL
        </Text>
        <TextLink href="/app">Zum Dashboard</TextLink>
      </SmallLayout>
    </>
  );
}
