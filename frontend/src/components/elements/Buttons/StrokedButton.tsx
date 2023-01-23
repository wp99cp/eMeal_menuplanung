import { ReactNode } from 'react';

interface StrokedButtonProps {
  external?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: (() => any) & (() => Promise<any>);
}

export const StrokedButton = ({
  onClick,
  className = ' ',
  children,
  external,
}: StrokedButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={className.concat(
        ' ',
        'inline-block rounded-lg px-4 py-1.5 text-base font-semibold leading-7 text-gray-900 ring-1 ring-gray-900/10 hover:ring-gray-900/20'
      )}
    >
      {children}
      {external ? <span aria-hidden="true"> &rarr;</span> : <></>}
    </button>
  );
};
