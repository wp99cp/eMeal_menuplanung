import SimpleInputField, { SimpleInputFieldPropsType } from '@ui/inputs/SimpleInputField';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/20/solid';
import useDebounce from '@ui/utils/debounce';
import { useWithDefaultHook } from '@ui/utils/useWithDefaultHook';

export enum FieldState {
  LOADING = 'loading', // eslint-disable-line no-unused-vars
  ERROR = 'error', // eslint-disable-line no-unused-vars
  SUCCESS = 'success', // eslint-disable-line no-unused-vars
  DEFAULT = 'default', // eslint-disable-line no-unused-vars
}

export type ErrorMsgString = string;
export type InputFieldState = {
  state: FieldState;
  stateMsg: ErrorMsgString;
};

/*
 * We omit the postfix property from the SimpleInputFieldProps type
 * because the StatefulInputField uses it to display state.
 *
 * The same is done for the children property.
 *
 */
interface StatefulInputFieldProps extends SimpleInputFieldPropsType {
  postfix?: never; // This enforces that postfix cannot be passed
  children?: never; // This enforces that children cannot be passed
  title?: never; // This enforces that title cannot be passed, use the stateMsg instead

  valueHook?: [string, Dispatch<SetStateAction<string>>];
  stateHook?: [InputFieldState, Dispatch<SetStateAction<InputFieldState>>];

  strokeValidation?: (_: string) => Promise<InputFieldState>;
  inputValidation?: (_: string) => Promise<InputFieldState>;
}

export type StatefulInputFieldPropsType = StatefulInputFieldProps;

const useInputValidation = (
  [state, setState]: [InputFieldState, Dispatch<SetStateAction<InputFieldState>>],
  value: string,
  valFunc: ((_: string) => Promise<InputFieldState>) | undefined
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

/**
 *
 * Returns a default validation function for the stroke of the input field.
 * Based on the build in HTML5 validation.
 *
 *
 * @param props
 * */
const getDefaultValidation: (
  _: SimpleInputFieldPropsType
) => (_: string) => Promise<InputFieldState> = (props) => {
  const dummyInput = document.createElement('input');
  if (props.max) dummyInput.max = props.max;
  if (props.min) dummyInput.min = props.min;
  dummyInput.type = props.type || 'text';

  return async (value: string) => {
    dummyInput.value = value;
    if (!dummyInput.validity.valid)
      return { state: FieldState.ERROR, stateMsg: dummyInput.validationMessage };
    return { state: FieldState.DEFAULT, stateMsg: '' };
  };
};

/**
 * Extends the SimpleInputField component with input validation and state management.
 *
 */
const StatefulInputField = ({
  strokeValidation,
  inputValidation,
  valueHook: valueHookOrUndefined,
  stateHook: stateHookOrUndefined,
  ...simpleInputFieldProps
}: StatefulInputFieldPropsType) => {
  const stateHook = useWithDefaultHook<InputFieldState>(stateHookOrUndefined, {
    state: FieldState.DEFAULT,
    stateMsg: '',
  });

  const valueHook = useWithDefaultHook<string>(valueHookOrUndefined, '');

  const [value, setValue] = valueHook;
  const debouncedValue = useDebounce(value, 500);

  const [{ state, stateMsg }] = stateHook;

  const [strokeValidationWithDefault] = useState(
    () => strokeValidation || (async () => ({ state: FieldState.DEFAULT, stateMsg: '' }))
  );
  useInputValidation(stateHook, value, strokeValidationWithDefault);

  const [inputValidationWithDefault] = useState(
    () => inputValidation || getDefaultValidation(simpleInputFieldProps)
  );
  useInputValidation(stateHook, debouncedValue, inputValidationWithDefault);

  let postfix = <></>;
  if (state === FieldState.ERROR) {
    postfix = (
      <ExclamationCircleIcon
        className="h-5 w-5 text-red-500 opacity-70"
        aria-hidden="true"
      />
    );
  } else if (state === FieldState.SUCCESS) {
    postfix = (
      <CheckCircleIcon className="h-5 w-5 text-green-500 opacity-70" aria-hidden="true" />
    );
  } else if (state === FieldState.LOADING) {
    postfix = (
      <ArrowPathIcon
        className="h-5 w-5 animate-spin text-gray-400 opacity-70"
        aria-hidden="true"
      />
    );
  }

  return (
    <SimpleInputField
      {...simpleInputFieldProps}
      postfix={postfix}
      title={stateMsg}
      valueHook={[value, setValue]}
    >
      {state === 'error' && stateMsg !== '' && (
        <p className="mt-1 text-sm text-accent-600" id="email-error">
          {state === 'error' ? stateMsg : ''}
        </p>
      )}
    </SimpleInputField>
  );
};
export default StatefulInputField;
