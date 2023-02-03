// These styles apply to every route in the application
import './globals.css';

import { ReactNode } from 'react';
import Header from '@/components/navigation/Header';
import { Footer } from '@/components/surfaces/Footer';
import SessionProvider from '@/components/provider/SessionProvider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className="h-full min-h-full">
      <body className="flex h-screen flex-col justify-between bg-gray-100 dark:bg-zinc-900">
        <SessionProvider>
          <Header />

          <main className="mb-auto contents">{children}</main>

          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
