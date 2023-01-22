import { ReactNode } from 'react';
import Link, { LinkProps } from 'next/link';

interface TextLinkProps {
  children: ReactNode;
}

export const TextLink = ({ href, children }: TextLinkProps & LinkProps) => {
  return (
    <Link href={href} className="font-semibold text-accent-500">
      {children}
    </Link>
  );
};
