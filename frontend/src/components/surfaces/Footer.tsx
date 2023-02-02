import Image from 'next/image';
import logo from '@/assets/logo.svg';
import build from '@/build';

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
      { name: 'Impressum', href: '#' },
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
        className="border-t-2 border-gray-200 bg-white "
        aria-labelledby="footer-heading"
      >
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8">
              <Image className="h-8 w-auto sm:h-10" src={logo} alt="" />
              <p className="text-sm leading-6 text-gray-600">
                Mit eMeal - Menüplanung kannst du Rezepte, Mahlzeiten sowie ganze Lager
                online erstellen, verwalten und zu einer Broschüre zusammenstellen.
              </p>
              <div className="flex space-x-6"></div>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:col-span-2 xl:mt-0 xl:grid-cols-4">
              {navigation.map((section) => (
                <div key={section.title}>
                  <h3 className="mt-6 text-sm font-semibold leading-6 text-gray-900">
                    {section.title}
                  </h3>
                  <ul role="list" className="mt-4 space-y-2">
                    {section.links.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24">
            <p className="mb-8 text-xs font-bold leading-5 text-gray-500">
              &copy; {today.getFullYear()} Cevi.Tools - eMeal Menüplanung
            </p>
            <p className="text-xs leading-5 text-gray-500">
              <a href="https://github.com/wp99cp/eMeal_menuplanung">
                Source code available under AGPL.
              </a>
            </p>
            <p className="text-xs leading-5 text-gray-500">
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
