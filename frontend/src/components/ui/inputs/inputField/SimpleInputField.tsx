import { cva } from 'class-variance-authority';
import { ChangeEvent, Dispatch, PropsWithChildren, SetStateAction } from 'react';

interface SimpleInputFieldProps {
  /*
   * accept
   *
   * This attribute is not supported by the SimpleInputField component as
   * SimpleInputField does not support file uploads. Use SimpleFileUpload instead.
   *
   */

  /*
   * alt
   *
   * This attribute is not supported by the SimpleInputField component as
   * SimpleInputField does not support type="image".
   *
   */

  /**
   * The value attribute is directly passed to the underlying HTML input element.
   * Specifies whether an input element should have autocomplete enabled
   *
   * @type { 'on' | 'off' }
   * @default 'on'
   *
   */
  autoComplete?: 'on' | 'off';

  /**
   * If set to true, the underlying HTML input element will be extended with the autofocus attribute.
   * Specifies that an input element should automatically get focus when the page loads
   *
   * @type { boolean }
   * @default false
   *
   */
  autofocus?: boolean;

  /*
   * checked
   *
   * This attribute is not supported by the SimpleInputField component as
   * SimpleInputField does not support type="checkbox" or type="radio".
   *
   * Use SimpleCheckbox or SimpleRadio instead.
   */

  /*
   * dirname
   *
   * This attribute is not supported by the SimpleInputField component.
   *
   */

  /**
   * If set to true, the underlying HTML input element will be extended with the autofocus disabled.
   * Specifies that an input element should be disabled
   *
   * @type { boolean }
   * @default false
   *
   */
  disabled?: boolean;

  /*
   * form, formaction, formenctype, formmethod, formnovalidate, formtarget
   *
   * These attributes are not supported by the SimpleInputField component.
   *
   */

  /*
   * height
   *
   * This attribute is not supported by the SimpleInputField component as
   * SimpleInputField does not support type="image".
   *
   */

  /*
   * list
   *
   * For now this attribute is not supported by the SimpleInputField component.
   * TODO: Implement support for the list attribute, this could be useful in the future
   *
   */

  /**
   * The max attribute is directly passed to the underlying HTML input element.
   * Specifies the maximum value for an input element
   *
   * @type { number }
   * @default undefined
   *
   */
  max?: string;

  /**
   * The maxLength attribute is directly passed to the underlying HTML input element.
   * Specifies the maximum number of characters allowed in an input element
   *
   * @type { number }
   * @default undefined
   *
   */
  maxLength?: number;

  /**
   * The min attribute is directly passed to the underlying HTML input element.
   * Specifies the minimum length of an input value, e.g. if set to 10,
   * and the input type is text, at most 10 characters can be entered.
   *
   * @type { number }
   * @default undefined
   *
   */
  min?: string;

  /*
   * minlenght
   *
   * This attribute is not supported by the SimpleInputField component.
   * Use StatefulInputField instead together with input validation.
   */

  /*
   * multiple
   *
   * This attribute is not supported by the SimpleInputField component as
   * SimpleInputField does not support type="file".
   *
   */

  /**
   * The name attribute is directly passed to the underlying HTML input element.
   * The name is optional and is defaulted the ID element
   *
   * @type {string}
   * @default { id }
   *
   * */
  name?: string;

  /*
   * pattern
   *
   * The pattern attribute is not supported by the SimpleInputField component.
   * Use StatefulInputField instead together with input validation.
   *
   * TODO: maybe this could be brought back in the future
   *
   */

  /**
   * The placeholder attribute is directly passed to the underlying HTML input element.
   *
   * @type {string}
   * @default ''
   *
   */
  placeholder?: string;

  /**
   * The readonly attribute is directly passed to the underlying HTML input element.
   * Specifies that an input field is read-only
   *
   * @type {boolean}
   * @default false
   *
   */
  readonly?: boolean;

  /**
   * Specifies that an input field must be filled out before submitting the form
   *
   * @type {boolean}
   * @default false
   */
  required?: boolean;

  /*
   * size
   * The size attribute is not supported by the SimpleInputField component.
   * Use styling instead, you can pass styles using the className attribute.
   *
   */

  /*
   * src
   * The src attribute is not supported by the SimpleInputField component as
   * SimpleInputField does not support type="image" or type="file".
   *
   */

  /**
   * The step attribute is directly passed to the underlying HTML input element.
   * Specifies the interval between legal numbers in an input field.
   *
   * @type {number}
   * @default undefined
   *
   */
  step?: number;

  /**
   * The type attribute is directly passed to the underlying HTML input element.
   * Note that the SimpleInputField component does not support all input types.
   * Consider using the other components for more specific input types.
   *
   * @type {string}
   * @default 'text'
   *
   * */
  type?: 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url';

  /**
   * The id attribute is directly passed to the underlying HTML input element.
   *
   * @type {string}
   *
   * */
  id: string;

  /*
   * value
   * The value attribute is not supported by the SimpleInputField component.
   * Use the valueHook instead.
   */

  /*
   * width
   * The width attribute is not supported by the SimpleInputField component.
   * Use styling instead, you can pass styles using the className attribute.
   */

  /**
   * The description is displayed as a label above the input field. If the
   * label_description is not set, no label will be rendered
   *
   * @type {string}
   *
   * */
  label_description?: string;

  /**
   * The prefix is displayed as a label in front of the input field. If the
   * prefix is not set, no prefix will be rendered
   *
   * @type {string}
   * @default ''
   *
   */
  prefix?: string | JSX.Element | (() => JSX.Element);

  /**
   * The postfix is displayed as a label behind the input field. If the
   * postfix is not set, no postfix will be rendered
   *
   * @type {string}
   * @default ''
   *
   */
  postfix?: string | JSX.Element | (() => JSX.Element);

  /**
   * The stateHook is used to set the value of the input field and to update
   * the value of the input field. The stateHook is an array with two elements.
   */
  valueHook?: [string, Dispatch<SetStateAction<string>>];

  /**
   * Those classNames are passed to the div container enveloping the input field,
   * the label and the description. The string my contain any (TailwindCSS) classNames.
   *
   */
  className?: string;

  /**
   * The title is displayed as a tooltip when hovering over the input field.
   * If the title is not set, no tooltip will be displayed.
   *
   * @type {string}
   * @default undefined
   *
   */
  title?: string;
}

export type SimpleInputFieldPropsType = PropsWithChildren<SimpleInputFieldProps>;

/**
 * The SimpleInputField component is a simple input field. It is a wrapper around
 * the HTML input element. The SimpleInputField component does not support all input
 * types and attributes of the HTML input element.
 *
 * Consider using the other components for more specific input types.
 *
 */
const SimpleInputField = ({
  id,
  autoComplete = 'on',
  autofocus = false,
  disabled = false,
  max,
  maxLength,
  min,
  name = id,
  placeholder = '',
  readonly = false,
  required = false,
  step,
  type = 'text',
  label_description,
  prefix = '',
  postfix = '',
  valueHook,
  className = '',
  children,
  title,
}: PropsWithChildren<SimpleInputFieldProps>) => {
  const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    if (valueHook) valueHook[1](event.target.value);
  };

  const inputElementStyles = cva(
    [
      'block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 ',
      'shadow-sm focus:border-accent-500 focus:outline-none focus:ring-accent-500 sm:text-sm bg-gray-100',
    ],
    {
      variants: {
        withPrefix: {
          true: ['pl-8'],
        },
      },
    }
  );

  const simpleInputFieldStyles = cva([className], {
    variants: {},
  });

  const postAndPrefixStyles = cva(
    ['absolute inset-y-0 flex items-center', 'overflow-y-hidden', 'select-none'],
    {
      variants: {
        hasPrefix: {
          true: ['left-0 pl-3', 'pointer-events-none'],
        },
        hasPostfix: {
          true: ['right-0 pr-3'],
        },
        hasTitle: {
          false: ['pointer-events-none'],
        },
      },
    }
  );

  return (
    <div className={simpleInputFieldStyles({})}>
      {
        // The label is optional and is only rendered
        // if the label_description is set
        label_description && (
          <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label_description}
          </label>
        )
      }

      <div className="relative mt-1 rounded-md shadow-sm">
        {prefix && typeof prefix === 'string' && prefix !== '' && (
          <div className={postAndPrefixStyles({ hasPrefix: true })}>
            <span className="text-gray-500 sm:text-sm">{prefix}</span>
          </div>
        )}

        {prefix && typeof prefix !== 'string' && (
          <div className={postAndPrefixStyles({ hasPrefix: true })}>{<>{prefix}</>}</div>
        )}

        <input
          id={id}
          autoComplete={autoComplete}
          {...(autofocus ? { autoFocus: true } : {})}
          {...(disabled ? { disabled: true } : {})}
          {...(max ? { max: max } : {})}
          {...(maxLength ? { maxLength: maxLength } : {})}
          {...(min ? { min: min } : {})}
          name={name}
          placeholder={placeholder}
          {...(readonly ? { readonly: true } : {})}
          {...(required ? { required: true } : {})}
          {...(step ? { step: step } : {})}
          type={type}
          {...(valueHook ? { value: valueHook[0] } : {})}
          {...(valueHook ? { onChange: onChangeHandler } : {})}
          title=""
          className={inputElementStyles({ withPrefix: prefix !== '' })}
        />

        {postfix && typeof postfix === 'string' && postfix !== '' && (
          <div
            className={postAndPrefixStyles({ hasPostfix: true, hasTitle: title !== '' })}
            title={title}
          >
            <span className="text-gray-500 sm:text-sm">{postfix}</span>
          </div>
        )}

        {postfix && typeof postfix !== 'string' && (
          <div
            className={postAndPrefixStyles({ hasPostfix: true, hasTitle: title !== '' })}
            title={title}
          >
            {<>{postfix}</>}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};
export default SimpleInputField;
