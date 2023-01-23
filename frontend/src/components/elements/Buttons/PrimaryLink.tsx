import { ReactNode } from 'react';
import Link, { LinkProps } from 'next/link';

interface PrimaryLinkProps {
  external?: boolean;
  children: ReactNode;
  className?: string;
}

export const PrimaryLink = ({
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
        'inline-block rounded-lg bg-accent-500 px-4 py-1.5 text-base font-semibold leading-7 text-white shadow-sm ring-1 ring-accent-600 hover:bg-accent-600 hover:ring-accent-700'
      )}
    >
      {children}
      {external ? (
        <span className="text-accent-200" aria-hidden="true">
          {' '}
          &rarr;
        </span>
      ) : (
        <></>
      )}
    </Link>
  );
};
