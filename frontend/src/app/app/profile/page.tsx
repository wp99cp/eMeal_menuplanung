'use client';

import { Switch } from '@headlessui/react';
import { NextPage } from 'next';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toggleDarkMode, useColorMode } from '@/hocks/useColorMode';

const Page: NextPage = () => {
  // redirect to login page if not logged in

  const { data } = useSession();
  const user = data?.user;

  const tabs = [
    { name: 'Allgemein', href: '#general', current: true },
    { name: 'Password', href: '#password', current: false },
  ];

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  const [autoUpdateApplicantDataEnabled, setAutoUpdateApplicantDataEnabled] = useState(
    user?.shareEmail || false
  );

  const [darkMode, setDarkMode] = useColorMode();

  return user ? (
    <>
      <div className="relative mx-auto max-w-4xl md:px-8 xl:px-0">
        <div className="pt-10 pb-16">
          <div className="px-4 sm:px-6 md:px-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Einstellungen
            </h1>
          </div>
          <div className="px-4 sm:px-6 md:px-0">
            <div className="py-6">
              {/* Tabs */}
              <div className="lg:hidden">
                <label htmlFor="selected-tab" className="sr-only">
                  Select a tab
                </label>
                <select
                  id="selected-tab"
                  name="selected-tab"
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-accent-500 focus:outline-none focus:ring-accent-500 sm:text-sm"
                  defaultValue={tabs.find((tab) => tab.current)?.name}
                >
                  {tabs.map((tab) => (
                    <option key={tab.name}>{tab.name}</option>
                  ))}
                </select>
              </div>
              <div className="hidden lg:block">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                      <a
                        key={tab.name}
                        href={tab.href}
                        className={classNames(
                          tab.current
                            ? 'border-accent-500 text-accent-600'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                          'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                        )}
                      >
                        {tab.name}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Description list with inline editing */}
              <div className="mt-10 divide-y divide-gray-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Dein Profile
                  </h3>
                  <p className="max-w-2xl text-sm text-gray-500">
                    This information will be displayed publicly so be careful what you
                    share.
                  </p>
                </div>
                <div className="mt-6">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        <span className="flex-grow">{user.name}</span>
                        <span className="ml-4 flex-shrink-0">
                          <button
                            type="button"
                            className="rounded-md bg-white font-medium text-accent-600 hover:text-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
                          >
                            Update
                          </button>
                        </span>
                      </dd>
                    </div>

                    <Switch.Group
                      as="div"
                      className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:pt-5"
                    >
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        <span className="flex-grow">{user.email}</span>
                        <span className="ml-4 flex-shrink-0">
                          <button
                            type="button"
                            className="rounded-md bg-white font-medium text-accent-600 hover:text-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
                          >
                            Update
                          </button>
                        </span>
                      </dd>

                      <Switch.Label
                        as="dt"
                        className="text-sm font-medium text-gray-500"
                        passive
                      >
                        Share Email together with Username
                      </Switch.Label>
                      <dd className="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        <Switch
                          checked={autoUpdateApplicantDataEnabled}
                          onChange={setAutoUpdateApplicantDataEnabled}
                          className={classNames(
                            autoUpdateApplicantDataEnabled
                              ? 'bg-accent-600'
                              : 'bg-gray-200',
                            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 sm:ml-auto'
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={classNames(
                              autoUpdateApplicantDataEnabled
                                ? 'translate-x-5'
                                : 'translate-x-0',
                              'inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                            )}
                          />
                        </Switch>
                      </dd>
                    </Switch.Group>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:border-b sm:border-gray-200 sm:py-5">
                      <dt className="text-sm font-medium text-gray-500">Benutzername</dt>
                      <dd className="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        <span className="flex-grow">@{user.username}</span>
                        <span className="ml-4 flex-shrink-0">
                          <button
                            type="button"
                            className="rounded-md bg-white font-medium text-accent-600 hover:text-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
                          >
                            Update
                          </button>
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-10 divide-y divide-gray-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Dein Account
                  </h3>
                  <p className="max-w-2xl text-sm text-gray-500">
                    This information will be displayed publicly so be careful what you
                    share.
                  </p>
                </div>
                <div className="mt-6">
                  <dl className="divide-y divide-gray-200">
                    <Switch.Group
                      as="div"
                      className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:pt-5"
                    >
                      <Switch.Label
                        as="dt"
                        className="text-sm font-medium text-gray-500"
                        passive
                      >
                        Dark-Mode
                      </Switch.Label>
                      <dd className="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        <Switch
                          checked={darkMode === 'dark'}
                          onChange={() => setDarkMode(toggleDarkMode(darkMode))}
                          className={classNames(
                            darkMode === 'dark' ? 'bg-accent-600' : 'bg-gray-200',
                            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 sm:ml-auto'
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={classNames(
                              darkMode === 'dark' ? 'translate-x-5' : 'translate-x-0',
                              'inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                            )}
                          />
                        </Switch>
                      </dd>
                    </Switch.Group>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <></>
  );
};

export default Page;
