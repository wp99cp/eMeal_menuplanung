'use client';

import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { PrimaryLink } from '@/components/elements/Buttons/PrimaryLink';
import logo from '../../assets/logo.svg';
import Image from 'next/image';
import { TextLink } from '@/components/elements/TextLink';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

function MobileNavigation() {
  const { data } = useSession();

  return (
    <Transition
      as={Fragment}
      enter="duration-200 ease-out"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="duration-100 ease-in"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <Popover.Panel
        focus
        className="absolute inset-x-0 top-0 origin-top-right transform p-2 transition md:hidden z-50"
      >
        <div className="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="px-5 pt-5 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <a href="/">
                  <span className="sr-only">Cevi.Tools</span>
                  <Image className="h-8 w-auto sm:h-10" src={logo} alt="" />
                </a>
              </div>
              <div className="-mr-2">
                <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-500">
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </Popover.Button>
              </div>
            </div>
          </div>
          <div className="space-y-6 py-6 px-5">
            {!data?.user.name && (
              <div>
                <a
                  href="/auth/signup"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-accent-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-accent-700"
                >
                  Registrieren
                </a>
                <p className="mt-6 text-center text-base font-medium text-gray-500">
                  Bestehendes Konto?{' '}
                  <TextLink href="/auth/signin">Anmelden</TextLink>
                </p>
              </div>
            )}
          </div>
        </div>
      </Popover.Panel>
    </Transition>
  );
}

export default function Header() {
  const { data } = useSession();

  return (
    <Popover className="relative bg-white border-b-2 border-gray-200 z-20 sticky top-0">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between py-4 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <a href="/">
              <span className="sr-only">Cevi.Tools</span>
              <Image className="h-8 w-auto sm:h-10" src={logo} alt="" />
            </a>
          </div>
          <div className="-my-2 -mr-2 md:hidden">
            <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-500">
              <span className="sr-only">Open menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </Popover.Button>
          </div>

          <div className="hidden items-center justify-end md:flex md:flex-1 lg:w-0">
            {!data?.user.name && (
              <>
                <Link
                  href="/auth/signin"
                  className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
                >
                  Anmelden
                </Link>
                <PrimaryLink className="ml-8" href="/auth/signup">
                  Registrieren
                </PrimaryLink>
              </>
            )}
            {data?.user.name && (
              <>
                <PrimaryLink href="/app/profile">Benutzerkonto</PrimaryLink>
              </>
            )}
          </div>
        </div>
      </div>

      <MobileNavigation />
    </Popover>
  );
}
