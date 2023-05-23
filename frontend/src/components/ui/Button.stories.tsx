import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@ui/Button';

export default {
  component: Button,
  argTypes: {
    fullWidth: {
      type: 'boolean',
    },
  },
} as Meta<typeof Button>;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  render: (args) => <Button {...args}>Default Button</Button>,
};

export const Primary: Story = {
  render: (args) => <Button {...args}>Primary Button</Button>,
  args: { intent: 'primary' },
};

export const Stroked: Story = {
  render: (args) => <Button {...args}>Stroked Button</Button>,
  args: { intent: 'stroked' },
};

export const Danger: Story = {
  render: (args) => <Button {...args}>Warning Button</Button>,
  args: { intent: 'danger' },
};
