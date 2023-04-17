import { ReactNode } from 'react';

export const Text = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <p className={className.concat(' ', 'mt-2 text-lg leading-8 text-gray-600')}>
      {children}
    </p>
  );
};
