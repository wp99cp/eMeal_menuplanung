import { ReactNode } from 'react';

export const Paragraph = ({ children }: { children: ReactNode; className?: string }) => {
  return <p className="mt-2 text-lg leading-8 text-gray-600">{children}</p>;
};
