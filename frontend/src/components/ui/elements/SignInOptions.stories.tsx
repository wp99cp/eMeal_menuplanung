import type { Meta, StoryObj } from '@storybook/react';
import SignInOptions from '@ui/elements/SignInOptions';

export default {
  component: SignInOptions,
} as Meta<typeof SignInOptions>;
type Story = StoryObj<typeof SignInOptions>;

export const Default: Story = {
  render: () => <SignInOptions />,
};
