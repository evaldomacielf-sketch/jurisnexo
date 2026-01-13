// ============================================
// 📋 Kanban Types
// ============================================

export type CaseCategory =
    | 'DANOS_MORAIS'
    | 'FAMILIA'
    | 'IMOBILIARIO'
    | 'CORPORATIVO'
    | 'CONTENCIOSO';

export type CaseStatus =
    | 'LEADS'
    | 'TRIAGEM'
    | 'CONTRATO'
    | 'ATIVO'
    | 'CONCLUIDO';

export type PriorityLevel = 'NORMAL' | 'URGENT' | 'HIGH';

export interface CaseCard {
    id: string;
    clientName: string;
    category: CaseCategory;
    description: string;
    status: CaseStatus;
    priority?: PriorityLevel;
    assignedTo?: {
        id: string;
        name: string;
        avatar?: string;
        initials: string;
    };
    tags?: string[];
    lastUpdate: Date;
    unreadMessages?: number;
}

export interface KanbanColumn {
    id: CaseStatus;
    title: string;
    cards: CaseCard[];
    color?: string;
}

export interface WhatsAppConversation {
    id: string;
    clientName: string;
    clientAvatar?: string;
    clientInitials: string;
    lastMessage: string;
    messageType: 'text' | 'voice' | 'document';
    timestamp: Date;
    unreadCount: number;
    caseTag?: string;
    isActive?: boolean;
}

export interface PendingInvitation {
    id: string;
    name: string;
    initials: string;
    sentAt: Date;
}

// Dados mock para demonstração
export const MOCK_KANBAN_DATA: KanbanColumn[] = [
    {
        id: 'LEADS',
        title: 'Leads',
        cards: [
            {
                id: '1',
                clientName: 'João Pereira',
                category: 'DANOS_MORAIS',
                description: 'Consulta solicitada sobre acidente de trânsito em via urbana.',
                status: 'LEADS',
                assignedTo: {
                    id: '1',
                    name: 'Dr. Ricardo',
                    initials: 'DR',
                },
                lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
            },
            {
                id: '2',
                clientName: 'Emília Costa',
                category: 'FAMILIA',
                description: 'Dúvidas sobre mediação de divórcio consensual.',
                status: 'LEADS',
                priority: 'URGENT',
                assignedTo: {
                    id: '2',
                    name: 'Emília Costa',
                    initials: 'EC',
                },
                lastUpdate: new Date(Date.now() - 30 * 60 * 1000), // 30min atrás
            },
        ],
    },
    {
        id: 'TRIAGEM',
        title: 'Triagem',
        cards: [
            {
                id: '3',
                clientName: 'Sara Santos',
                category: 'IMOBILIARIO',
                description: 'Revisão de contrato de compra e venda.',
                status: 'TRIAGEM',
                assignedTo: {
                    id: '3',
                    name: 'Sara Santos',
                    initials: 'SS',
                },
                lastUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
            },
        ],
    },
    {
        id: 'CONTRATO',
        title: 'Contrato',
        cards: [
            {
                id: '4',
                clientName: 'Tecno S.A.',
                category: 'CORPORATIVO',
                description: 'Minuta de acordo de acionistas em revisão.',
                status: 'CONTRATO',
                assignedTo: {
                    id: '4',
                    name: 'Tecno S.A.',
                    initials: 'TS',
                },
                lastUpdate: new Date(Date.now() - 5 * 60 * 60 * 1000),
            },
        ],
    },
    {
        id: 'ATIVO',
        title: 'Ativo',
        cards: [
            {
                id: '5',
                clientName: 'Miguel Soares',
                category: 'CONTENCIOSO',
                description: 'Preparação para audiência de instrução.',
                status: 'ATIVO',
                assignedTo: {
                    id: '5',
                    name: 'Miguel Soares',
                    initials: 'MS',
                },
                lastUpdate: new Date(Date.now() - 1 * 60 * 60 * 1000),
            },
        ],
    },
];

export const CATEGORY_CONFIG: Record<CaseCategory, { label: string; color: string; bgColor: string }> = {
    DANOS_MORAIS: {
        label: 'Danos Morais',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
    },
    FAMILIA: {
        label: 'Família',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
    },
    IMOBILIARIO: {
        label: 'Imobiliário',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    },
    CORPORATIVO: {
        label: 'Corporativo',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
    },
    CONTENCIOSO: {
        label: 'Contencioso',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
    },
};
