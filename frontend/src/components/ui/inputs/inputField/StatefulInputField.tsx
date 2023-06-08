import SimpleInputField, {
  SimpleInputFieldPropsType,
} from '@ui/inputs/inputField/SimpleInputField';
import { Dispatch, SetStateAction, useState } from 'react';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/20/solid';
import useDebounce from '@ui/utils/debounce';
import { useWithDefaultHook } from '@ui/utils/useWithDefaultHook';
import { FieldState, StatefullFieldState } from '@ui/utils/statefullness';
import { useInputValidation } from '@ui/utils/inputValidation';

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
  stateHook?: [StatefullFieldState, Dispatch<SetStateAction<StatefullFieldState>>];

  strokeValidation?: (_: string) => Promise<StatefullFieldState>;
  inputValidation?: (_: string) => Promise<StatefullFieldState>;
}

export type StatefulInputFieldPropsType = StatefulInputFieldProps;

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
) => (_: string) => Promise<StatefullFieldState> = (props) => {
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
  const stateHook = useWithDefaultHook<StatefullFieldState>(stateHookOrUndefined, {
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
