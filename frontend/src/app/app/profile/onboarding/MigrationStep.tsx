const MigrationStepAction: () => boolean | Promise<boolean> = async () => true;

const MigrationStepContent: () => JSX.Element = () => (
  <>
    <p className="text-accent-500 mb-2 mt-8 font-bold">Daten übernehmen</p>
    <p className="mb-4 text-2xl font-bold">
      Daten aus dem &quot;alten&quot; eMeal - Menüplanung übernehmen.
    </p>
    <p className="my-2 font-medium text-gray-600">
      Die Lager, Mahlzeiten und Rezepte aus dem "alten" eMeal - Menüplanung werden
      automatisch übernommen.
    </p>

    <p></p>

    <p className="text-gray-700">
      Achtung: Wenn du diesen Schritt überspringst, können die Daten zu einem späteren
      Zeitpunkt nicht mehr übernommen werden.
    </p>
  </>
);

export { MigrationStepAction, MigrationStepContent };
