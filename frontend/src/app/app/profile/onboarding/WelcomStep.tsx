import { StepperCardArgs } from '@/app/app/profile/onboarding/page';

const WelcomeStepAction: () => boolean | Promise<boolean> = async () => true;

const WelcomeStepContent: (args: StepperCardArgs) => JSX.Element = () => (
  <>
    <p className="text-accent-500 font-bold mt-8 mb-2">Willkommen!</p>
    <p className="font-bold text-2xl mb-4">Neu bei eMeal - Menüplanung</p>
    <p className="text-gray-600 my-2 font-medium">
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
