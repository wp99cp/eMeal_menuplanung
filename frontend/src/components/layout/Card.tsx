import { Dispatch, ReactNode, SetStateAction } from 'react';

export type CardState = 'loading' | 'error' | 'default';
export const DefaultCardState = 'default';

export const Card = ({
  children,
  loadingScreen = (
    <>
      <span>Loading...</span>
    </>
  ),
  cardStateHook: [cardState] = [DefaultCardState, () => {}],
}: {
  children: ReactNode;
  loadingScreen?: JSX.Element;
  cardStateHook?: [CardState, Dispatch<SetStateAction<CardState>>];
}) => {
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="rounded-md bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        {cardState === 'loading' && loadingScreen}
        {cardState === 'default' && children}
      </div>
    </div>
  );
};
