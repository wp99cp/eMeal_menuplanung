import { ReactNode } from 'react';

export const Text = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <p
      className={className.concat(' ', 'mt-6 text-lg leading-8 text-gray-600')}
    >
      {children}
    </p>
  );
};
