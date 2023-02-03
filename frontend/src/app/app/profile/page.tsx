'use client';

import { Dialog, Transition } from '@headlessui/react';
import { NextPage } from 'next';
import { Fragment, RefObject, useEffect, useRef, useState } from 'react';
import { CheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const TourPopup = ({ over: ref }: { over: RefObject<HTMLDivElement> }) => {

  const margin = 10;

  const [bounds, setBounds] = useState({ height: 0, width: 0, x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => {
      setBounds(ref?.current?.getBoundingClientRect() || { height: 0, width: 0, x: 0, y: 0 });
    };

    if (typeof window !== 'undefined') {
      window?.addEventListener('resize', handleResize);
      window?.addEventListener('scroll', handleResize);
    }
    setTimeout(handleResize, 0);

  }, []);

  const [isOpen, setOpen] = useState(false);

  useEffect(() =>
      setOpen(bounds.height !== 0 || bounds.width !== 0),
    [bounds]);

  return (
    <>
      <Transition.Root show={isOpen} as={Fragment}>

        <div>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <svg height='100%' width='100%'
                 className='fixed w-screen h-screen w-screen flex justify-center items-center top-0 z-40'
                 style={{ pointerEvents: 'none' }}>
              <defs>
                <mask id='tour-mask'>
                  <rect x='0' y='0' width='100vw' height='100%' fill='white' />
                  <rect x={bounds.x - margin} y={bounds.y - margin} rx='2' width={bounds.width + 2 * margin}
                        height={bounds.height + 2 * margin} fill='black' />
                </mask>
              </defs>
              <rect x='0' y='0' width='100%' height='100%' fill='black' opacity='0.35' mask='url(#tour-mask)' />
            </svg>
          </Transition.Child>

          {typeof window !== 'undefined' && <>
            <div className='fixed z-40'
                 style={{
                   height: bounds.y - margin,
                   width: window?.innerWidth,
                   top: 0,
                   left: 0,
                 }} />
            <div className='fixed z-40'
                 style={{
                   height: bounds.height + 2 * margin,
                   width: bounds.x - margin,
                   top: bounds.y - margin,
                   left: 0,
                 }} />
            <div className='fixed z-40'
                 style={{
                   height: window?.innerHeight - bounds.y - bounds.height - margin,
                   width: window?.innerWidth,
                   top: bounds.y + bounds.height + margin,
                   left: 0,
                 }} />
            <div className='fixed z-40'
                 style={{
                   height: bounds.height + 2 * margin,
                   width: window?.innerWidth - bounds.x - bounds.width - margin,
                   top: bounds.y - margin,
                   left: bounds.x + bounds.width + margin,
                 }} />
          </>}
          <Dialog onClose={() => {
          }} className='fixed z-50 inset-0 overflow-y-auto' style={{
            top: bounds.y + bounds.height,
            left: bounds.x - margin,
          }}>

            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel
                className='relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6'>
                <div>
                  <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100'>
                    <InformationCircleIcon className='h-6 w-6 text-blue-600' aria-hidden='true' />
                  </div>
                  <div className='mt-3 text-center sm:mt-5'>

                    <Dialog.Title as='h3' className='text-lg font-medium leading-6 text-gray-900'>
                      Neues Lager Erfassen!
                    </Dialog.Title>

                    <div className='mt-2'>
                      <p className='text-sm text-gray-500'>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur amet labore.
                      </p>
                    </div>

                  </div>
                </div>
                <div className='mt-5 sm:mt-6'>
                  <button
                    type='button'
                    className='inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm'
                    onClick={() => setOpen(false)}
                  >
                    Go back to dashboard
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </Dialog>

        </div>
      </Transition.Root>
    </>);
};

const Page: NextPage = () => {
  // redirect to login page if not logged in

  const ref = useRef<HTMLDivElement>(null);

  return (
    <>

      <TourPopup over={ref} />

      <div className='mx-auto max-w-7xl py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          <div className='h-96 rounded-lg border-4 border-dashed border-gray-200'>
            <span ref={ref} className='h-28 w-18 block bg-orange-200 m-auto'>Hello</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
