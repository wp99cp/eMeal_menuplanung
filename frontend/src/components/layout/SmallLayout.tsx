import { ReactNode } from 'react';

export const SmallLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="mx-auto max-w-3xl pt-20 pb-32 sm:pt-48 sm:pb-40 px-6">
      {children}
    </div>
  );
};
