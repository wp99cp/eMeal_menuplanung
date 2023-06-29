import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/20/solid';

export type FieldState = 'loading' | 'error' | 'success' | 'default';
export type InputFieldState = [FieldState, string];

export const InputFieldDefaultState: InputFieldState = ['default', ''];
export const InputFieldLoadingState: InputFieldState = ['loading', ''];

interface TextInputProps {
  label?: string;
  id: string;
  name: string;
  type: string;
  description: string;
  placeholder?: string;
  autoComplete?: string;
  prefix?: string;
  required?: boolean | undefined;
  stateHook?: [string, Dispatch<SetStateAction<string>>];
  fieldState?: [[FieldState, string], Dispatch<SetStateAction<[FieldState, string]>>];
}

const TextInput = ({
  id,
  name,
  type,
  autoComplete,
  description,
  required = false,
  prefix = '',
  stateHook: [inputValue, setInputValue] = useState(''),
  fieldState: [[state, errorMessage]] = [
    ['default', ''],
    () => {
      throw new Error('Not Implemented');
    },
  ],
}: TextInputProps) => {
  let classes =
    'block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 ' +
    'shadow-sm focus:border-accent-500 focus:outline-none focus:ring-accent-500 sm:text-sm bg-gray-100';

  if (state === 'error') {
    classes = classes.concat(
      ' border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
    );
  }

  if (prefix !== '') {
    classes = classes.concat(' pl-8');
  }

  const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  return (
    <div className="h-24">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {description}
      </label>
      <div className="relative mt-1 rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 sm:text-sm">{prefix}</span>
        </div>
        <input
          value={inputValue}
          onChange={onChangeHandler}
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          className={classes}
        />
        {state === 'error' && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
        {state === 'success' && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <CheckCircleIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
          </div>
        )}
        {state === 'loading' && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ArrowPathIcon
              className="h-5 w-5 animate-spin text-gray-400"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      <p className="text-accent-600 mt-1 text-sm" id="email-error">
        {state === 'error' ? errorMessage : ''}
      </p>
    </div>
  );
};

export default TextInput;
