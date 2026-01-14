import type { Meta, StoryObj } from '@storybook/react';
import ClientForm from './ClientForm';
import { userEvent, within } from '@storybook/test';

const meta = {
    title: 'Features/CRM/ClientForm',
    component: ClientForm,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'Formulário para criação e edição de clientes no CRM.',
            },
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof ClientForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateMode: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Modo de criação de novo cliente.',
            },
        },
    },
};

export const WithValidationErrors: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Formulário mostrando erros de validação após tentativa de submissão inválida.',
            },
        },
    },
    play: async ({ canvasElement }) => {
        // Simula interação para mostrar erros
        const canvas = within(canvasElement);
        const submitButton = canvas.getByRole('button', { name: /criar cliente/i });
        await userEvent.click(submitButton);
    },
};
