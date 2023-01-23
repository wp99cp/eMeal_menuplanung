import { ReactNode } from 'react';
import { Text } from '@/components/elements/Text';

interface TitleProps {
  children?: ReactNode;
  heading: string;
}

export const Title = ({ children, heading }: TitleProps) => {
  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        {heading}
      </h1>
      <Text>{children}</Text>
    </>
  );
};
