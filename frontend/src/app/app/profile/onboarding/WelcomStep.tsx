import { StepperCardArgs } from '@/app/app/profile/onboarding/page';

const WelcomeStepAction: () => boolean | Promise<boolean> = async () => true;

const WelcomeStepContent: (args: StepperCardArgs) => JSX.Element = () => (
  <>
    <p className="mb-2 mt-8 font-bold text-accent-500">Willkommen!</p>
    <p className="mb-4 text-2xl font-bold">Neu bei eMeal - Menüplanung</p>
    <p className="my-2 font-medium text-gray-600">
      Du meldest dich das erste Mal an. Im Folgenden werden wir ein paar Dinge für dich
      einrichten.
    </p>
    <p className="text-gray-500">
      Keine Angst, falls du beim "alten" eMeal - Menüplanung bereits einen Account
      hattest, so werden wir deine Daten während dem Einrichten automatisch übernommen.
    </p>
  </>
);

export { WelcomeStepContent, WelcomeStepAction };
