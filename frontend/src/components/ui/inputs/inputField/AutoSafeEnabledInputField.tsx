import StatefulInputField, {
  StatefulInputFieldPropsType,
} from '@ui/inputs/inputField/StatefulInputField';
import { useState } from 'react';
import { useWithDefaultHook } from '@ui/utils/useWithDefaultHook';
import { FieldState, StatefullFieldState } from '@ui/utils/statefullness';

interface AutoSafeEnabledInputFieldProps extends StatefulInputFieldPropsType {
  /**
   * This function is called when the user stops typing.
   *
   * If this function evaluates to a FieldState.SUCCESS, then
   * the autoSaveCallback is executed.
   *
   */
  inputValidation: (_: string) => Promise<StatefullFieldState>;
  autoSaveCallback?: (_: string) => Promise<void>;
}

export type AutoSafeEnabledInputFieldPropsType = AutoSafeEnabledInputFieldProps;

/**
 * This component is a wrapper around the StatefulInputField.
 * It adds the functionality to automatically save the input
 * after the user has stopped typing and once it has been validated.
 *
 * For that the optional autoSaveCallback function can be provided.
 * It gets called once the inputValidation function evaluates to a FieldState.SUCCESS.
 *
 */
const AutoSafeEnabledInputField = ({
  valueHook: valueHookOrUndefined,
  stateHook: stateHookOrUndefined,
  strokeValidation,
  inputValidation,
  ...simpleInputFieldProps
}: AutoSafeEnabledInputFieldPropsType) => {
  const [strokeValidationWithDefault] = useState(
    () => strokeValidation || (async () => ({ state: FieldState.DEFAULT, stateMsg: '' }))
  );

  const stateHook = useWithDefaultHook<StatefullFieldState>(stateHookOrUndefined, {
    state: FieldState.DEFAULT,
    stateMsg: '',
  });

  const valueHook = useWithDefaultHook<string>(valueHookOrUndefined, '');

  const [inputValidationWithDefault] = useState(() => {
    return async (value: string) => {
      const inputValidationState: StatefullFieldState = await inputValidation(value);

      if (
        simpleInputFieldProps.autoSaveCallback !== undefined &&
        inputValidationState.state === FieldState.SUCCESS
      ) {
        await simpleInputFieldProps.autoSaveCallback(value);
      }

      return inputValidationState;
    };
  });

  return (
    <StatefulInputField
      strokeValidation={strokeValidationWithDefault}
      inputValidation={inputValidationWithDefault}
      valueHook={valueHook}
      stateHook={stateHook}
      {...simpleInputFieldProps}
    />
  );
};

export default AutoSafeEnabledInputField;
