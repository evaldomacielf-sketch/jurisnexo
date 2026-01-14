import type { Meta, StoryObj } from '@storybook/react';
import { ConversationList } from './ConversationList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Conversation } from '@/types/inbox';

const mockConversations: Conversation[] = [
    {
        id: '1',
        tenant_id: 'tenant-1',
        contact_id: 'contact-1',
        contact: {
            id: 'contact-1',
            name: 'João Silva',
            phone: '11999999999',
        },
        last_message: {
            id: 'msg-1',
            conversation_id: '1',
            sender_type: 'contact',
            sender_id: 'contact-1',
            content: 'Olá, preciso de ajuda com meu processo',
            message_type: 'text',
            is_read: false,
            sent_at: new Date().toISOString(),
        },
        unread_count: 3,
        status: 'open',
        priority: 'urgent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: '2',
        tenant_id: 'tenant-1',
        contact_id: 'contact-2',
        contact: {
            id: 'contact-2',
            name: 'Maria Santos',
            phone: '11988888888',
        },
        last_message: {
            id: 'msg-2',
            conversation_id: '2',
            sender_type: 'user',
            sender_id: 'user-1',
            content: 'Claro, vou verificar isso para você',
            message_type: 'text',
            is_read: true,
            sent_at: new Date(Date.now() - 3600000).toISOString(),
        },
        unread_count: 0,
        status: 'pending',
        priority: 'normal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
];

const meta = {
    title: 'Features/Inbox/ConversationList',
    component: ConversationList,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => {
            const queryClient = new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: false,
                        staleTime: Infinity,
                    },
                },
            });

            return (
                <QueryClientProvider client={queryClient}>
                    <div className="h-screen bg-white">
                        <Story />
                    </div>
                </QueryClientProvider>
            );
        },
    ],
} satisfies Meta<typeof ConversationList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        conversations: mockConversations,
        onSelect: (id: string) => alert(`Click: ${id}`),
    },
};

export const Empty: Story = {
    args: {
        conversations: [],
        onSelect: (id: string) => alert(`Click: ${id}`),
    },
};

export const Loading: Story = {
    args: {
        conversations: [], // Loading state usually handled by parent or suspense, mimicking empty here or could add loading prop if component supported it
        onSelect: (id: string) => { },
    },
    render: () => (
        <div className="p-4 text-center text-slate-500">Carregando conversas...</div>
    )
};
