import { cva, VariantProps } from 'class-variance-authority';
import { ComponentProps } from 'react';

const buttonStyles = cva(
  [
    'rounded-lg',
    'px-5 py-2.5 mr-2 mb-2',
    'font-medium text-sm',
    'focus:ring-4 focus:outline-none',
  ],
  {
    variants: {
      intent: {
        primary: [
          'text-white bg-blue-700',
          'hover:bg-blue-800',
          'focus:ring-blue-300',
          'dark:bg-blue-600 dark:hover:bg-blue-700  dark:focus:ring-blue-800',
        ],
        stroked: [
          'text-gray-900',
          'border border-gray-200',
          'hover:bg-gray-100 hover:text-blue-700',
          'focus:z-10 focus:ring-4 focus:ring-gray-200',
          'ring-2 ring-gray-900/10 hover:ring-gray-900/20',
          'dark:focus:ring-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700',
        ],
        danger: [
          'text-white bg-red-700',
          'hover:bg-red-800',
          'focus:ring-red-300',
          'dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900',
        ],
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      intent: 'primary',
    },
  }
);

export interface Props
  extends ComponentProps<'button'>,
    VariantProps<typeof buttonStyles> {}

export function Button({ intent, fullWidth, ...props }: Props) {
  return (
    <button type="button" className={buttonStyles({ intent, fullWidth })} {...props} />
  );
}
