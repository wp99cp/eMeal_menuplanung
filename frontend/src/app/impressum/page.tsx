import { SmallLayout } from '@/components/layout/SmallLayout';
import { Subtitle, Title } from '@ui/components/titles';
import { Paragraph } from '@ui/components/Text';

export default function LandingPage() {
  return (
    <>
      <SmallLayout>
        <Title>Impressum</Title>

        <Subtitle>Herausgeber und Betreiber</Subtitle>
        <Paragraph>
          Cevi.Tools,
          <br />
          eine Arbeitsgruppe des Cevi Schweiz
        </Paragraph>

        <Subtitle>Kontakt-Adresse</Subtitle>
        <Paragraph>
          Cevi.Tools <br />
          Geschäftsstelle <br />
          Sihlstrasse 33 <br />
          8001 Zürich
        </Paragraph>

        <Subtitle> E-Mail und Internet</Subtitle>
        <Paragraph>
          info@cevi.tools <br />
          eMeal.cevi.tools
        </Paragraph>
      </SmallLayout>
    </>
  );
}
