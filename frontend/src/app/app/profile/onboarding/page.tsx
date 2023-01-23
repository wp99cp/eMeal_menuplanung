'use client';

import StepperNav from '@/components/navigation/StepperNav';
import { useSearchParams } from 'next/navigation';
import { SmallLayout } from '@/components/layout/SmallLayout';
import { Title } from '@/components/elements/Title';
import { PrimaryLink } from '@/components/elements/Buttons/PrimaryLink';
import { StrokedLink } from '@/components/elements/Buttons/StrokedLink';
import { Card } from '@/components/layout/Card';

const steps = [
  {
    id: '01',
    name: 'Willkommen bei eMeal',
    step_name: 'welcome',
    status: 'current',
  },
  {
    id: '01',
    name: 'Account vervollständigen',
    step_name: 'account',
    status: 'upcoming',
  },
  {
    id: '02',
    name: 'Daten übernehmen',
    step_name: 'data-migration',
    status: 'upcoming',
  },
  {
    id: '03',
    name: 'Einführung und Loslegen',
    step_name: 'get-started',
    status: 'upcoming',
  },
];

const onboardingStep = (currentStep: string) => {
  switch (currentStep) {
    case 'welcome':
      return (
        <SmallLayout>
          <Title heading="Willkommen bei eMeal - Menüplanung." />
          <p>Welcome to eMeal v2</p>
        </SmallLayout>
      );
    case 'account':
      return (
        <>
          <p>Account vervollständigen</p>
        </>
      );
    case 'data-migration':
      return (
        <>
          <p>Daten aus dem alten eMeal migrieren</p>
        </>
      );
    case 'get-started':
      return (
        <>
          <p>Einführung und loslegen</p>
        </>
      );
  }
};

const OnboardingPage = () => {
  const searchParams = useSearchParams();
  const currentStep = searchParams.get('step') || steps[0].step_name;

  return (
    <>
      <Card>
        <div className="my-6">
          <StepperNav steps={steps} />
        </div>

        {onboardingStep(currentStep)}
        <div className="mt-2 grid grid-cols-3 gap-3">
          <div></div>
          <div className="grid place-content-end">
            <StrokedLink href="/app/profile/onboarding?step=account">
              Zurück
            </StrokedLink>
          </div>
          <div className="grid place-content-start">
            <PrimaryLink href="/app/profile/onboarding/welcome">
              Weiter
            </PrimaryLink>
          </div>
        </div>
      </Card>
    </>
  );
};

export default OnboardingPage;
