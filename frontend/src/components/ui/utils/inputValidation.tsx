import { FieldState, StatefullFieldState } from '@ui/utils/statefullness';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';

export const useInputValidation = (
  [state, setState]: [StatefullFieldState, Dispatch<SetStateAction<StatefullFieldState>>],
  value: string,
  valFunc: ((_: string) => Promise<StatefullFieldState>) | undefined
) => {
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value === prevValueRef.current) return;
    if (valFunc === undefined) return;
    valFunc(value).then((newState) => {
      // if the error has not changed, we do not need to update the state
      // otherwise we would get an infinite loop
      const errorHasNotChanged =
        (newState.state === state.state &&
          state.state === FieldState.ERROR &&
          state.stateMsg === newState.stateMsg) ||
        (newState.state === state.state && state.state !== FieldState.ERROR);
      if (errorHasNotChanged) return;

      setState(newState);
      prevValueRef.current = value;
    });
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
};
