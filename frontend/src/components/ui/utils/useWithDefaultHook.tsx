import { Dispatch, SetStateAction, useEffect, useState } from 'react';

/**
 * This custom hook converts an optional hook into a state hook with a default value.
 *
 * @param optionalHook the optional hook (i.g. it could be undefined)
 * @param defaultValue the default value
 */
export const useWithDefaultHook = <T,>(
  optionalHook: [T, Dispatch<SetStateAction<T>>] | undefined,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (optionalHook !== undefined) {
      setValue(optionalHook[0]);
    }
  }, [optionalHook]);

  return [value, setValue];
};
