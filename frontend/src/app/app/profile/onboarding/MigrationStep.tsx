import { StepperCardArgs } from '@/app/app/profile/onboarding/page';

const MigrationStepAction: () => boolean | Promise<boolean> = async () => true;

const MigrationStepContent: (args: StepperCardArgs) => JSX.Element = () => (
  <>
    <p className="text-accent-500 font-bold mt-8 mb-2">Daten übernehmen</p>
    <p className="font-bold text-2xl mb-4">
      Daten aus dem "alten" eMeal - Menüplanung übernehmen.
    </p>
    <p className="text-gray-600 my-2 font-medium">
      Die Lager, Mahlzeiten und Rezepte aus dem "alten" eMeal - Menüplanung
      werden automatisch übernommen.
    </p>

    <p></p>

    <p className="text-gray-700">
      Achtung: Wenn du diesen Schritt überspringst, können die Daten zu einem
      späteren Zeitpunkt nicht mehr übernommen werden.
    </p>
  </>
);

export { MigrationStepAction, MigrationStepContent };
