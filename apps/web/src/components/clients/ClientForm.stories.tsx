import type { Meta, StoryObj } from '@storybook/nextjs';
import { ClientForm } from './ClientForm';

const meta = {
  title: 'Clients/ClientForm',
  component: ClientForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ClientForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewClient: Story = {
  args: {},
};

export const EditMode: Story = {
  args: {
    clientId: 'test-client-id',
  },
};
