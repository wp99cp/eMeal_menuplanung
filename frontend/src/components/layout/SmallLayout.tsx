import { ReactNode } from 'react';

export const SmallLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-20 pb-32 sm:pt-48 sm:pb-40">{children}</div>
  );
};
