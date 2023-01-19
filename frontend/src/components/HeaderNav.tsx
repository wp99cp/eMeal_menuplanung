import {Disclosure} from '@headlessui/react'
import {Bars3Icon, MoonIcon, XMarkIcon} from '@heroicons/react/24/outline'
import {NextPage} from "next";
import {ProfileDropdown} from "@/components/ProfileDropdown";
import {useRouter} from "next/router";
import {signOut, useSession} from "next-auth/react";


const navigation = [
    {name: 'Dashboard', href: '#', current: true},
    {name: 'Team', href: '#', current: false},
    {name: 'Projects', href: '#', current: false},
    {name: 'Calendar', href: '#', current: false},
]

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

const HeaderNav: NextPage = () => {

    const router = useRouter();
    const session = useSession();

    return (
        <Disclosure as="nav" className="bg-gray-800">
            {({open}) => (
                <>
                    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                        <div className="relative flex h-16 items-center justify-between">
                            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                {/* Mobile menu button*/}
                                <Disclosure.Button
                                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true"/>
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true"/>
                                    )}
                                </Disclosure.Button>
                            </div>

                            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                                <div className="flex flex-shrink-0 items-center">
                                    <img
                                        className="block h-8 w-auto lg:hidden"
                                        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                                        alt="Your Company"
                                    />
                                    <img
                                        className="hidden h-8 w-auto lg:block"
                                        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                                        alt="Your Company"
                                    />
                                </div>
                                <div className="hidden sm:ml-6 sm:block">
                                    <div className="flex space-x-4">
                                        {navigation.map((item) => (
                                            <a
                                                key={item.name}
                                                href={item.href}
                                                className={classNames(
                                                    item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                                    'px-3 py-2 rounded-md text-sm font-medium'
                                                )}
                                                aria-current={item.current ? 'page' : undefined}
                                            >
                                                {item.name}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {session.data?.user ? (<>
                                <div
                                    className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">

                                    <button
                                        type="button"
                                        className="rounded-full bg-gray-800 p-1 m-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-0 focus:ring-offset-gray-800"
                                    >
                                        <span className="sr-only">View notifications</span>
                                        <MoonIcon className="h-6 w-6" aria-hidden="true"/>
                                    </button>

                                    {/* Profile dropdown */}
                                    <ProfileDropdown element={({active}) => (
                                        <a onClick={() => router.push('your-profile')}
                                           className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                        > Dein Profile </a>
                                    )} element1={({active}) => (
                                        <a href="#"
                                           className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                        >
                                            Settings
                                        </a>
                                    )} element2={({active}) => (
                                        <a onClick={() => signOut()}
                                           className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                        >
                                            Sign out
                                        </a>
                                    )}/>

                                </div>
                            </>) : (<>


                                <button
                                    type="button"
                                    className="p-1 m-2 inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                                    onClick={() => router.push('/login')}
                                >
                                    Login
                                </button>


                                <button
                                    type="button"
                                    className="p-1 m-2 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Sign Up
                                </button>

                            </>)}


                        </div>
                    </div>

                    <Disclosure.Panel className="sm:hidden">
                        <div className="space-y-1 px-2 pt-2 pb-3">
                            {navigation.map((item) => (
                                <Disclosure.Button
                                    key={item.name}
                                    as="a"
                                    href={item.href}
                                    className={classNames(
                                        item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                        'block px-3 py-2 rounded-md text-base font-medium'
                                    )}
                                    aria-current={item.current ? 'page' : undefined}
                                >
                                    {item.name}
                                </Disclosure.Button>
                            ))}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    )
}

export default HeaderNav;
