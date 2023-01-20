'use client';

// These styles apply to every route in the application
import './globals.css';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className="min-h-full h-full">
      <body className="bg-gray-100 dark:bg-gray-800 flex flex-col h-screen">
        <SessionProvider>
          <h1 className="text-3xl font-bold underline">Root Layout</h1>
          {children}
          <footer>Global Footer</footer>
        </SessionProvider>
      </body>
    </html>
  );
}
