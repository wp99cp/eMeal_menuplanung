import React from 'react';
import { SmallLayout } from '@/components/layout/SmallLayout';
import { Paragraph } from '@ui/components/Text';
import { Title } from '@ui/components/titles';

export default function ForgotPassword() {
  return (
    <>
      <SmallLayout>
        <Title>Passwort vergessen?</Title>
        <Paragraph>
          Zur Zeit kann das Passwort leider noch nicht zurückgesetzt werden.
        </Paragraph>
      </SmallLayout>
    </>
  );
}
