import { ReactNode } from 'react';
import Link, { LinkProps } from 'next/link';

interface PrimaryLinkProps {
  external?: boolean;
  children: ReactNode;
  className?: string;
}

export const StrokedLink = ({
  href,
  className = ' ',
  children,
  external,
}: PrimaryLinkProps & LinkProps) => {
  return (
    <Link
      href={href}
      className={className.concat(
        ' ',
        'inline-block rounded-lg px-4 py-1.5 text-base font-semibold leading-7 text-gray-900 ring-1 ring-gray-900/10 hover:ring-gray-900/20'
      )}
    >
      {children}
      {external ? <span aria-hidden="true"> &rarr;</span> : <></>}
    </Link>
  );
};
