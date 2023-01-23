import { ReactNode } from 'react';

interface PrimaryButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const PrimaryButton = ({
  className = ' ',
  children,
  onClick,
}: PrimaryButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={className.concat(
        ' ',
        'inline-block rounded-lg bg-accent-500 px-4 py-1.5 text-base font-semibold leading-7 text-white shadow-sm ring-1 ring-accent-600 hover:bg-accent-600 hover:ring-accent-700'
      )}
    >
      {children}
    </button>
  );
};
