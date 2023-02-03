'use client';

import { useState } from 'react';
import { EllipsisHorizontalIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import useColorMode from '@/hocks/useColorMode';

const SpeedDial = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useColorMode();

  return (
    <div
      className="group absolute bottom-6 right-6"
      onMouseEnter={() => setMenuOpen(true)}
      onMouseLeave={() => setMenuOpen(false)}
    >
      {isMenuOpen && (
        <div
          id="speed-dial-menu-square"
          className="mb-2 flex flex-col items-center space-y-2"
        >
          <button
            type="button"
            onClick={() => setDarkMode(darkMode === 'light' ? 'dark' : 'light')}
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-400"
          >
            {darkMode === 'light' && <MoonIcon className="h-6 w-6" aria-hidden="true" />}
            {darkMode === 'dark' && <SunIcon className="h-6 w-6" aria-hidden="true" />}
            <span className="sr-only">toggle dark-mode</span>
          </button>
        </div>
      )}

      <button
        type="button"
        data-dial-toggle="speed-dial-menu-square"
        aria-controls="speed-dial-menu-square"
        aria-expanded="false"
        className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-700 text-white hover:bg-orange-800 focus:outline-none focus:ring-4 focus:ring-orange-300 dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-blue-800"
      >
        <EllipsisHorizontalIcon className="h-6 w-6" aria-hidden="true" />

        <span className="sr-only">Open actions menu</span>
      </button>
    </div>
  );
};
export default SpeedDial;
