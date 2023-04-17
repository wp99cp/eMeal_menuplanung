import { ReactNode } from 'react';

export const SmallLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-32 pt-20 sm:pb-40 sm:pt-48">
      {children}
    </div>
  );
};
