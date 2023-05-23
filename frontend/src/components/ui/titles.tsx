import { ReactNode } from 'react';

interface TitleProps {
  children?: ReactNode;
}

export const Title = ({ children }: TitleProps) => {
  return (
    <>
      <h1 className="mb-12 text-4xl font-bold tracking-tight text-gray-700 sm:text-6xl">
        {children}
      </h1>
    </>
  );
};

export const Subtitle = ({ children }: TitleProps) => {
  return (
    <>
      <h2 className="mb-3 mt-8 text-2xl font-bold	tracking-tight text-gray-700 sm:text-3xl">
        {children}
      </h2>
    </>
  );
};

export const Subsubtitle = ({ children }: TitleProps) => {
  return (
    <>
      <h3 className="text-1xl mb-2 mt-6 font-bold	tracking-tight text-gray-700 sm:text-2xl">
        {children}
      </h3>
    </>
  );
};
