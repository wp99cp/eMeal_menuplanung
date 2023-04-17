import React from 'react';
import { Title } from '@/components/elements/Title';
import { SmallLayout } from '@/components/layout/SmallLayout';
import { Text } from '@/components/elements/Text';

export default function ForgotPassword() {
  return (
    <>
      <SmallLayout>
        <Title>Passwort vergessen?</Title>
        <Text>Zur Zeit kann das Passwort leider noch nicht zurückgesetzt werden.</Text>
      </SmallLayout>
    </>
  );
}
