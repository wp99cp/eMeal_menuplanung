import { ReactNode } from 'react';

export const Card = ({ children }: { children: ReactNode }) => {
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="rounded-md bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        {' '}
        {children}
      </div>
    </div>
  );
};
