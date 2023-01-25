// These styles apply to every route in the application
import './globals.css';

import { ReactNode } from 'react';
import Header from '@/components/navigation/Header';
import { Footer } from '@/components/surfaces/Footer';
import SessionProvider from '@/components/provider/SessionProvider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className="min-h-full h-full">
      <body className="bg-gray-100 dark:bg-gray-800 flex flex-col h-screen justify-between">
        <SessionProvider>
          <Header />

          <main className="mb-auto">{children}</main>

          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
