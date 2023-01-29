import { AnnouncementBadge } from '@/components/elements/Badges/AnnouncementBadge';
import { SmallLayout } from '@/components/layout/SmallLayout';
import { TextLink } from '@/components/elements/TextLink';
import { PrimaryLink } from '@/components/elements/Buttons/PrimaryLink';
import {
  AdjustmentsHorizontalIcon,
  CheckBadgeIcon,
  RocketLaunchIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { StrokedLink } from '@/components/elements/Buttons/StrokedLink';
import { Title } from '@/components/elements/Title';
import { Text } from '@/components/elements/Text';

const features = [
  {
    name: 'Anpassbare Mengen',
    description: `Die Mengen deiner Rezepte lassen sich jeder Zeit anpassen. So kannst du 
    ohne zusätzlichen Aufwand und ganz spontan auf geänderte Teilnehmeranzahl reagieren.
     eMeal erstellt automatisch eine entsprechende Einkaufsliste.`,
    icon: AdjustmentsHorizontalIcon,
  },
  {
    name: 'Automatisches Lagerdossier',
    description: `Mit wenigen Klicks erhältst du ein fix fertiges Lagerhandbuch als PDF. 
    Mit dabei Wochenplan zum Ausdrucken und aufhängen, für jeden Tag Einkaufslisten und 
    kombiniert für das ganze Lager sowie alle deine Rezepte.`,
    icon: RocketLaunchIcon,
  },
  {
    name: 'Gemeinsam Bearbeiten',
    description: `Lager können in Echtzeit gemeinsam bearbeitet werden. Kein lästiges 
    Zusammenführen von Dokumenten und Tabellen. Während dem Lager kannst du alle Rezepte 
    bequem auch auf dem Smartphone anschauen.`,
    icon: UsersIcon,
  },
  {
    name: 'Automatische Imports und Geprüfte Vorlagen',
    description: `Von diversen Internetseiten können Rezepte automatisch importiert werden.
    Zusätzlich stehen dir eine Reihe von geprüfte Vorlagen aus dem Kochbuch "Feine Lagerküche" zur Verfügung.`,
    icon: CheckBadgeIcon,
  },
];

export default function LandingPage() {
  return (
    <>
      <SmallLayout>
        <div className="hidden sm:mb-8 sm:flex sm:justify-center">
          <AnnouncementBadge
            caption="Stolz präsentieren wir die neue Version von eMeal - Menüplanung."
            linkText="Mehr erfahren."
            href="/about/eMeal-version-2"
          />
        </div>

        <section className="sm:text-center">
          <Title heading="eMeal - Menüplanung. Lagerküche online planen."></Title>
          <Text>
            Mit eMeal - Menüplanung kannst du Rezepte, Mahlzeiten sowie ganze Lager online
            erstellen, verwalten und zu einer Broschüre zusammenstellen.{' '}
            <TextLink href="/about">Mehr Erfahren.</TextLink>
          </Text>

          <div className="mt-8 flex gap-x-4 sm:justify-center">
            <PrimaryLink href="/auth/signin" external={true}>
              Anmelden
            </PrimaryLink>

            <StrokedLink href="/auth/signin?with-demo-user=true" external={true}>
              {' '}
              Live Demo
            </StrokedLink>
          </div>
        </section>
      </SmallLayout>

      <section>
        <div className="py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="sm:text-center">
              <h2 className="text-lg font-semibold leading-8 text-accent-600">
                eMeal - Menüplanung
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Der beste Weg deine Lagerküche zu planen.
              </p>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                eMeal - Menüplanung ist ein interaktives Planungstool für die Lagerküche.
                Sei es für das Cevi-, Pfadi- oder Klassenlager mit eMeal kannst du deine
                Menüpläne direkt im Browser erstellen. Verwalten deine Rezepte und
                Mahlzeiten online und erstelle mit einem Klick eine Lager-Broschüre. Die
                Planung des Essens für ein Lager, war noch nie so einfach!
              </p>
            </div>

            <div className="mt-20 max-w-lg sm:mx-auto md:max-w-none">
              <div className="grid grid-cols-1 gap-y-16 md:grid-cols-2 md:gap-x-12 md:gap-y-16">
                {features.map((feature) => (
                  <div
                    key={feature.name}
                    className="relative flex flex-col gap-6 sm:flex-row md:flex-col lg:flex-row"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500 text-white sm:shrink-0">
                      <feature.icon className="h-8 w-8" aria-hidden="true" />
                    </div>
                    <div className="sm:min-w-0 sm:flex-1">
                      <p className="text-lg font-semibold leading-8 text-gray-900">
                        {feature.name}
                      </p>
                      <p className="mt-2 text-base leading-7 text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
