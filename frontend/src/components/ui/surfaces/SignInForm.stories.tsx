import type { Meta, StoryObj } from '@storybook/react';
import SignInForm from '@ui/surfaces/SignInForm';

export default {
  component: SignInForm,
} as Meta<typeof SignInForm>;
type Story = StoryObj<typeof SignInForm>;

export const Default: Story = {
  render: () => <SignInForm />,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};
