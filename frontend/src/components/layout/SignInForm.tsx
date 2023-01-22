/*
  This example requires some changes to your config:

  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import Image from 'next/image';
import logo from '@/assets/logo.svg';
import { TextLink } from '@/components/basics/TextLink';
import { signIn } from 'next-auth/react';
import { PrimaryButton } from '@/components/basics/Buttons/PrimaryButton';

export default function SignInForm() {
  return (
    <>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Image
              className="mx-auto h-12 w-auto"
              src={logo}
              alt="Cevi.Tools Logo"
            />

            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Anmelden und loslegen
            </h2>
            <p className="text-center text-gray-600">
              Oder ein <TextLink href="/auth/signup">neuer Account</TextLink>{' '}
              erstellen.
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <form className="space-y-6" action="#" method="POST">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Mail-Adresse
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Passwort
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Angemeldet bleiben
                    </label>
                  </div>

                  <div className="text-sm">
                    <TextLink href="/auth/forgot-password">
                      Passwort vergessen?
                    </TextLink>
                  </div>
                </div>

                <div>
                  <PrimaryButton
                    className="flex w-full justify-center"
                    onClick={() => signIn()}
                  >
                    Anmelden
                  </PrimaryButton>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">
                      oder anmelden mit
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div>
                    <a
                      onClick={() => signIn('cevi-db')}
                      href="#"
                      className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                    >
                      <span className="sr-only">Mit CeviDB anmelden</span>
                      <svg
                        width="20px"
                        height="20px"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <g id="surface1">
                          <path d="M 12.867188 14.289062 C 11.492188 14.683594 10.113281 14.929688 8.808594 15.027344 L 13.683594 19.890625 L 15.410156 13.4375 C 14.644531 13.738281 13.800781 14.019531 12.867188 14.289062 Z M 17.203125 6.238281 C 15.429688 7.398438 13.257812 8.394531 11.234375 8.976562 C 8.457031 9.777344 5.625 10.023438 3.464844 9.660156 L 0.164062 6.363281 L 18.492188 1.4375 Z M 17.203125 6.238281 " />
                          <path d="M 0.265625 7.636719 C 0.242188 7.542969 0.226562 7.449219 0.21875 7.347656 L 2.183594 9.3125 C 1.121094 8.933594 0.460938 8.359375 0.265625 7.636719 Z M 19.894531 9.714844 C 18.507812 11.414062 16.28125 12.632812 12.6875 13.667969 C 9.023438 14.722656 5.367188 14.6875 3.371094 13.585938 C 2.671875 13.195312 2.230469 12.707031 2.066406 12.128906 L 1.011719 9.519531 C 1.054688 9.542969 1.09375 9.566406 1.132812 9.589844 C 3.28125 10.78125 7.320312 10.789062 11.417969 9.613281 C 14.695312 8.667969 18.132812 6.761719 19.894531 4.921875 Z M 13.683594 2.066406 L 0.878906 5.488281 C 2.199219 3.605469 5.289062 1.753906 8.867188 0.726562 C 9.875 0.4375 12.121094 0.0742188 13.683594 0.132812 Z M 13.683594 2.066406 " />
                        </g>
                      </svg>
                    </a>
                  </div>

                  <div>
                    <a
                      onClick={() => signIn('google')}
                      href="#"
                      className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                    >
                      <span className="sr-only">Mit Google anmelden</span>
                      <svg
                        fill="currentColor"
                        viewBox="0 0 30 30"
                        className="h-5 w-5"
                      >
                        <path d="M 15.003906 3 C 8.3749062 3 3 8.373 3 15 C 3 21.627 8.3749062 27 15.003906 27 C 25.013906 27 27.269078 17.707 26.330078 13 L 25 13 L 22.732422 13 L 15 13 L 15 17 L 22.738281 17 C 21.848702 20.448251 18.725955 23 15 23 C 10.582 23 7 19.418 7 15 C 7 10.582 10.582 7 15 7 C 17.009 7 18.839141 7.74575 20.244141 8.96875 L 23.085938 6.1289062 C 20.951937 4.1849063 18.116906 3 15.003906 3 z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
