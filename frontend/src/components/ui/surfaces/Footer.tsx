import Image from 'next/image';
import logo_footer from '@/assets/logo_footer.svg';
import build from '@/build';
import Link from 'next/link';
import logger from '@/logger';

const navigation = [
  {
    title: 'Erklärungen',
    links: [
      { name: 'Über eMeal - Menüplanung', href: '/about' },
      { name: 'Hilfe und Anleitungen', href: '/help' },
    ],
  },
  {
    title: 'Kontakt',
    links: [
      { name: 'Kontakt', href: '#' },
      { name: 'Datenschutzbestimmungen', href: '#' },
      { name: 'Impressum', href: '/impressum' },
    ],
  },
  {
    title: 'Ideen & Rezepte',
    links: [
      {
        name: 'Kochbuch: Feine Lagerküche',
        href: 'https://www.lagerkueche.ch/bestellung',
      },
      {
        name: 'Rezeptsammlung',
        href: 'https://wiki.cevi.ch/index.php/Kategorie:Rezept',
      },
    ],
  },
  {
    title: 'Hilfsmittel zur Lagerküche',
    links: [
      { name: 'Tipps und Tricks', href: '#' },
      {
        name: 'Merkblatt Kochen im Lager',
        href: 'https://www.sz.ch/public/upload/assets/47775/Merkblatt_Kochen%20im%20Lager.pdf',
      },
    ],
  },
];

export const Footer = () => {
  logger.info('Footer 123');

  const today = new Date();

  const format: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    year: 'numeric',
    month: '2-digit',
    timeZone: 'Europe/Zurich',
  };

  return (
    <>
      <footer
        className="bg-footer_blue-700 text-footer_blue-50 flow-root"
        aria-labelledby="footer-heading"
      >
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-16 sm:pt-24 lg:mt-16 lg:px-8 lg:pt-16 xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Image className="h-8 w-auto sm:h-10" src={logo_footer} alt="" />
            <p className="max-w-[500px] text-sm leading-6">
              Mit eMeal - Menüplanung kannst du Rezepte, Mahlzeiten sowie ganze Lager
              online erstellen, verwalten und zu einer Broschüre zusammenstellen.
            </p>
            <div className="flex space-x-6"></div>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:col-span-2 xl:mt-0 xl:grid-cols-4">
            {navigation.map((section) => (
              <div key={section.title}>
                <h3 className="mb-4 mt-8 text-sm font-semibold leading-6">
                  {section.title}
                </h3>
                <ul role="list" className="space-y-4">
                  {section.links.map((item) => (
                    <li key={item.name} className="leading-tight">
                      <Link
                        href={item.href}
                        className="text-sm leading-tight hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-footer_blue-900 text-footer_blue-100 px-6 pb-8 pt-12 sm:mt-20 lg:mt-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="mb-8 text-xs font-bold leading-5">
              &copy; {today.getFullYear()} Cevi.Tools - eMeal Menüplanung
            </p>
            <p className="text-xs leading-5">
              <Link href="https://github.com/wp99cp/eMeal_menuplanung">
                Source code available under AGPL.
              </Link>
            </p>
            <p className="text-xs leading-5">
              Version: <b>{build.version}</b>
              <br />
              Build: {build.git.hash} ({build.git.branch}) vom{' '}
              {new Date(build.timestamp).toLocaleDateString('de-CH', format)}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};
