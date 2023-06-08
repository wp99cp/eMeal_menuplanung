import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from '@ui/surfaces/Footer';

export default {
  component: Footer,
} as Meta<typeof Footer>;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {
  render: () => <Footer />,
};
