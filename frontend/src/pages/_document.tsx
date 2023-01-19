import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html className="min-h-full h-full">
      <Head />
      <body>
        <div className="bg-gray-100 dark:bg-gray-800 flex flex-col h-screen">
          <Main />
          <NextScript />
        </div>
      </body>
    </Html>
  );
}
