'use client';

import { useState } from 'react';
import { EllipsisHorizontalIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import useColorMode from '@/hocks/useColorMode';

const SpeedDial = () => {

  const [isMenuOpen, setMenuOpen] = useState(true);
  const [darkMode, setDarkMode] = useColorMode();


  return <div className='absolute group bottom-6 right-6' onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}>

    {(isMenuOpen &&
      <div id='speed-dial-menu-square' className='flex flex-col items-center mb-2 space-y-2'>

        <button type='button'
                onClick={() => setDarkMode(darkMode === 'light' ? 'dark' : 'light')}
                className='flex justify-center items-center w-12 h-12 text-gray-500 hover:text-gray-900 bg-white rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm dark:hover:text-white dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:focus:ring-gray-400'>
          {darkMode === 'light' && <MoonIcon className='w-6 h-6' aria-hidden='true' />}
          {darkMode === 'dark' && <SunIcon className='w-6 h-6' aria-hidden='true' />}
          <span className='sr-only'>toggle dark-mode</span>
        </button>


      </div>)}

    <button type='button' data-dial-toggle='speed-dial-menu-square' aria-controls='speed-dial-menu-square'
            aria-expanded='false'
            className='flex items-center justify-center text-white bg-orange-700 rounded-lg w-12 h-12 hover:bg-orange-800 dark:bg-orange-600 dark:hover:bg-orange-700 focus:ring-4 focus:ring-orange-300 focus:outline-none dark:focus:ring-blue-800'>

      <EllipsisHorizontalIcon className='w-6 h-6' aria-hidden='true' />

      <span className='sr-only'>Open actions menu</span>
    </button>

  </div>;
};
export default SpeedDial;