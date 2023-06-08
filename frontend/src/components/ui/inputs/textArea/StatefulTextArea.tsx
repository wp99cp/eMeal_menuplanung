import { Dispatch, SetStateAction, useState } from 'react';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/20/solid';
import useDebounce from '@ui/utils/debounce';
import { useWithDefaultHook } from '@ui/utils/useWithDefaultHook';
import { FieldState, StatefullFieldState } from '@ui/utils/statefullness';
import SimpleTextArea, {
  SimpleTextAreaPropsType,
} from '@ui/inputs/textArea/SimpleTextArea';
import { useInputValidation } from '@ui/utils/inputValidation';

/*
 * We omit the postfix property from the SimpleTextAreaProps type
 * because the StatefulTextArea uses it to display state.
 *
 * The same is done for the children property.
 *
 */
interface StatefulTextAreaProps extends SimpleTextAreaPropsType {
  children?: never; // This enforces that children cannot be passed
  title?: never; // This enforces that title cannot be passed, use the stateMsg instead

  valueHook?: [string, Dispatch<SetStateAction<string>>];
  stateHook?: [StatefullFieldState, Dispatch<SetStateAction<StatefullFieldState>>];

  strokeValidation?: (_: string) => Promise<StatefullFieldState>;
  inputValidation?: (_: string) => Promise<StatefullFieldState>;
}

export type StatefulTextAreaPropsType = StatefulTextAreaProps;

/**
 * Extends the SimpleInputField component with input validation and state management.
 *
 */
const StatefulTextArea = ({
  strokeValidation,
  inputValidation,
  valueHook: valueHookOrUndefined,
  stateHook: stateHookOrUndefined,
  ...simpleInputFieldProps
}: StatefulTextAreaProps) => {
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
    () => inputValidation || (async () => ({ state: FieldState.DEFAULT, stateMsg: '' }))
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
    <SimpleTextArea
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
    </SimpleTextArea>
  );
};
export default StatefulTextArea;
