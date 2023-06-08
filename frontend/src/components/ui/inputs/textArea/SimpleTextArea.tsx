import { cva } from 'class-variance-authority';
import { ChangeEvent, Dispatch, PropsWithChildren, SetStateAction } from 'react';

interface SimpleTextAreaProps {
  /**
   * If set to true, the underlying HTML textarea element will be extended with the autofocus attribute.
   * Specifies that the textarea element should automatically get focus when the page loads
   *
   * @type { boolean }
   * @default false
   *
   */
  autofocus?: boolean;

  /*
   * cols
   *
   * This attribute is not supported by the SimpleTextArea component.
   * Use the className property to set the width of the textarea element.
   *
   */

  /*
   * dirname
   *
   * This attribute is not supported by the SimpleTextArea component.
   *
   */

  /**
   * If set to true, the underlying HTML textarea element will be extended with the autofocus disabled.
   * Specifies that an textarea element should be disabled
   *
   * @type { boolean }
   * @default false
   *
   */
  disabled?: boolean;

  /*
   * form
   *
   * This attribute is not supported by the SimpleTextArea component as
   *
   */

  /**
   * The maxLength attribute is directly passed to the underlying HTML textarea element.
   * Specifies the maximum number of characters allowed in an textarea element
   *
   * @type { number }
   * @default undefined
   *
   */
  maxLength?: number;

  /**
   * The name attribute is directly passed to the underlying HTML textarea element.
   * The name is optional and is defaulted the ID element
   *
   * @type {string}
   * @default { id }
   *
   * */
  name?: string;

  /**
   * The placeholder attribute is directly passed to the underlying HTML textarea element.
   *
   * @type {string}
   * @default ''
   *
   */
  placeholder?: string;

  /**
   * The readonly attribute is directly passed to the underlying HTML textarea element.
   * Specifies that a textarea field is read-only
   *
   * @type {boolean}
   * @default false
   *
   */
  readonly?: boolean;

  /**
   * Specifies that a textarea field must be filled out before submitting the form
   *
   * @type {boolean}
   * @default false
   */
  required?: boolean;

  /*
   * rows
   *
   * This attribute is not supported by the SimpleTextArea component.
   * Use the className property to set the height of the textarea element.
   *
   */

  /*
   * wrap
   *
   * This attribute is not supported by the SimpleTextArea component
   *
   */

  /**
   * The id attribute is directly passed to the underlying HTML textarea element.
   *
   * @type {string}
   *
   * */
  id: string;

  /**
   * The description is displayed as a label above the textarea field. If the
   * label_description is not set, no label will be rendered
   *
   * @type {string}
   *
   * */
  label_description?: string;

  /**
   * The postfix is displayed as a label on the top right of the textarea field. If the
   * postfix is not set, no postfix will be rendered
   *
   * @type {string}
   * @default ''
   *
   */
  postfix?: string | JSX.Element | (() => JSX.Element);

  /**
   * The stateHook is used to set the value of the textarea field and to update
   * the value of the textarea field. The stateHook is an array with two elements.
   */
  valueHook?: [string, Dispatch<SetStateAction<string>>];

  /**
   * Those classNames are passed to the div container enveloping the textarea field,
   * the label and the description. The string my contain any (TailwindCSS) classNames.
   *
   */
  className?: string;

  /**
   * The title is displayed as a tooltip when hovering over the textarea field.
   * If the title is not set, no tooltip will be displayed.
   *
   * @type {string}
   * @default undefined
   *
   */
  title?: string;
}

export type SimpleTextAreaPropsType = PropsWithChildren<SimpleTextAreaProps>;

/**
 * The SimpleTextArea component is a simple textarea field. It is a wrapper around
 * the HTML textarea element.
 *
 */
const SimpleTextArea = ({
  id,
  autofocus = false,
  disabled = false,
  maxLength,
  name = id,
  placeholder = '',
  readonly = false,
  required = false,
  label_description,
  postfix = '',
  valueHook,
  className = '',
  children,
  title,
}: PropsWithChildren<SimpleTextAreaProps>) => {
  const onChangeHandler = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (valueHook) valueHook[1](event.target.value);
  };

  const textAreaElementStyles = cva(
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

  const simpleTextAreaFieldStyles = cva([className], {
    variants: {},
  });

  const postAndPrefixStyles = cva(
    ['absolute inset-y-0 flex items-center', 'overflow-y-hidden h-[36px]', 'select-none'],
    {
      variants: {
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
    <div className={simpleTextAreaFieldStyles({})}>
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
        <textarea
          id={id}
          {...(autofocus ? { autoFocus: true } : {})}
          {...(disabled ? { disabled: true } : {})}
          {...(maxLength ? { maxLength: maxLength } : {})}
          name={name}
          placeholder={placeholder}
          {...(readonly ? { readonly: true } : {})}
          {...(required ? { required: true } : {})}
          {...(valueHook ? { value: valueHook[0] } : {})}
          {...(valueHook ? { onChange: onChangeHandler } : {})}
          title=""
          className={textAreaElementStyles({})}
        ></textarea>

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
export default SimpleTextArea;
