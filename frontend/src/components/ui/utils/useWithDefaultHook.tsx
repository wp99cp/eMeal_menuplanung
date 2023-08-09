import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

/**
 * This custom hook converts an optional hook into a state hook with a default value.
 * If the optional hook is defined, the two hooks are synchronized.
 *
 * If the optional hook is undefined, the default value is used.
 *
 * @param optionalHook the optional hook (i.g. it could be undefined)
 * @param defaultValue the default value
 */

export const useWithDefaultHook = <T,>(
  optionalHook: [T, Dispatch<SetStateAction<T>>] | undefined,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState(optionalHook?.[0] || defaultValue);

  const prevValueRef = useRef<T>(value);
  const prevValueOptionalRef = useRef<T>(
    (optionalHook && optionalHook[0]) || defaultValue
  );

  useEffect(() => {
    if (optionalHook && optionalHook[0]) {
      if (prevValueOptionalRef.current === optionalHook[0]) return;
      setValue(optionalHook[0]);
      prevValueOptionalRef.current = optionalHook[0];
    }
  }, [optionalHook]);

  useEffect(() => {
    if (optionalHook) {
      if (value === prevValueRef.current) return;
      optionalHook[1](value);
      prevValueRef.current = value;
    }
  }, [optionalHook, value]);

  return [value, setValue];
};
