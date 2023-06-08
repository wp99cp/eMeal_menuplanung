import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from '@ui/components/Divider';

export default {
  component: Divider,
} as Meta<typeof Divider>;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  render: () => <Divider />,
};

export const Named: Story = {
  render: (args) => <Divider {...args}>this is a named divider</Divider>,
};
