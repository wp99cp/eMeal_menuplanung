import { Subtitle, Title } from '@/components/elements/Title';
import { Text } from '@ui/components/Text';
import { SmallLayout } from '@/components/layout/SmallLayout';

export default function LandingPage() {
  return (
    <>
      <SmallLayout>
        <Title>Impressum</Title>

        <Subtitle>Herausgeber und Betreiber</Subtitle>
        <Text>
          Cevi.Tools,
          <br />
          eine Arbeitsgruppe des Cevi Schweiz
        </Text>

        <Subtitle>Kontakt-Adresse</Subtitle>
        <Text>
          Cevi.Tools <br />
          Geschäftsstelle <br />
          Sihlstrasse 33 <br />
          8001 Zürich
        </Text>

        <Subtitle> E-Mail und Internet</Subtitle>
        <Text>
          info@cevi.tools <br />
          eMeal.cevi.tools
        </Text>
      </SmallLayout>
    </>
  );
}
