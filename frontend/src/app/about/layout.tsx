import { ReactNode } from 'react';
import { SmallLayout } from '@/components/layout/SmallLayout';

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <SmallLayout>{children}</SmallLayout>;
}
