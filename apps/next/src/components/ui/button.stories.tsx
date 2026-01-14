import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Save, Trash2, Plus } from 'lucide-react';

const meta = {
    title: 'UI/Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
        },
        size: {
            control: 'select',
            options: ['default', 'sm', 'lg', 'icon'],
        },
        disabled: {
            control: 'boolean',
        },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: 'Button',
    },
};

export const Variants: Story = {
    render: () => (
        <div className="flex flex-col gap-4">
            <Button variant="default">Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
        </div>
    ),
};

export const Sizes: Story = {
    render: () => (
        <div className="flex items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
        </div>
    ),
};

export const WithIcons: Story = {
    render: () => (
        <div className="flex flex-col gap-4">
            <Button>
                <Save className="h-4 w-4 mr-2" />
                Salvar
            </Button>
            <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
            </Button>
            <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
            </Button>
        </div>
    ),
};

export const Disabled: Story = {
    args: {
        children: 'Disabled Button',
        disabled: true,
    },
};

export const Loading: Story = {
    render: () => (
        <Button disabled>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Carregando...
        </Button>
    ),
};
