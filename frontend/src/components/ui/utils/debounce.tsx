'use client';

import { useEffect, useState } from 'react';

/**
 *
 * Debounces a value by delaying its update until a specified time has elapsed.
 * This is useful for scenarios such as search inputs, where you want to wait for the user to finish typing before performing a search.
 *
 * @template T - The type of the value being debounced.
 * @param value - The value to be debounced.
 * @param delay - The delay in milliseconds before updating the debounced value.
 * @returns The debounced value.
 *
 * adapted from: https://dev.to/gabe_ragland/debouncing-with-react-hooks-jci
 *
 * */
export default function useDebounce<T>(value: T, delay: number): T {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Return a cleanup function that will be called every time ...
    // ... useEffect is re-called. useEffect will only be re-called ...
    // ... if value changes (see the inputs array below).
    // This is how we prevent debouncedValue from changing if value is ...
    // ... changed within the delay period. Timeout gets cleared and restarted.
    // To put it in context, if the user is typing within our app's ...
    // ... search box, we don't want the debouncedValue to update until ...
    // ... they've stopped typing (timeout of delay).
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
