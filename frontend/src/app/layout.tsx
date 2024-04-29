// These styles apply to every route in the application
import './globals.css';

import { ReactNode } from 'react';
import Header from '@/components/navigation/Header';
import { Footer } from '@ui/surfaces/Footer';
import SessionProvider from '@/components/provider/SessionProvider';
import { getCookies } from 'cookies-next';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// either Static metadata
export const metadata = {
  title: 'eMeal - Menüplanung',
  description:
    'Mit eMeal - Menüplanung kannst du Rezepte, ' +
    'Mahlzeiten sowie ganze Lager online erstellen, verwalten und ' +
    'zu einer Broschüre zusammenstellen.',
  applicationName: 'eMeal - Menüplanung',
  publisher: 'Cevi.Tools',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  keywords: [
    'eMeal',
    'Menüplanung',
    'Rezepte',
    'Lager',
    'Cevi',
    'Cevi.Tools',
    'Pfadi',
    'Jubla',
  ],

  // TODO: add Icon
  // TODO: add robots and robots.txt
  // TODO: add themeColor
  // TODO: add manifest
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className="h-full min-h-full">
      <body className="flex h-screen flex-col justify-between bg-gray-100 dark:bg-zinc-800 dark:text-gray-200">
        <SessionProvider>
          <Header />

          <main className="mb-auto contents">{children}</main>

          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
