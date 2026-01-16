// ============================================
// 📋 Client Types & Interfaces
// ============================================

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LEAD = 'lead',
  ARCHIVED = 'archived',
}

export enum ClientType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

export enum ClientPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum InteractionType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  WHATSAPP = 'whatsapp',
  INSTAGRAM = 'instagram',
  NOTE = 'note',
  OTHER = 'other',
}

export interface Client {
  id: string;
  tenantId: string;

  // Dados Pessoais
  name: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  birthDate?: string;

  // Endereço
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  addressZipcode?: string;

  // Status
  status: ClientStatus;
  type: ClientType;
  source?: string;
  priority: ClientPriority;

  // Metadata
  notes?: string;
  tags?: string[];
  avatarUrl?: string;

  // Responsável
  assignedTo?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations
  interactions?: ClientInteraction[];
  documents?: ClientDocument[];
}

export interface ClientInteraction {
  id: string;
  clientId: string;
  userId: string;
  type: InteractionType;
  subject?: string;
  description: string;
  durationMinutes?: number;
  outcome?: string;
  occurredAt: string;
  createdAt: string;
}

export interface ClientDocument {
  id: string;
  clientId: string;
  uploadedBy: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  category?: string;
  tags?: string[];
  createdAt: string;
}

export interface CreateClientDTO {
  name: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  birthDate?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  addressZipcode?: string;
  status?: ClientStatus;
  type?: ClientType;
  source?: string;
  priority?: ClientPriority;
  notes?: string;
  tags?: string[];
  assignedTo?: string;
}

export interface CreateInteractionDTO {
  clientId: string;
  type: InteractionType;
  subject?: string;
  description: string;
  durationMinutes?: number;
  outcome?: string;
  occurredAt?: string;
}

export interface CreateDocumentDTO {
  clientId: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  category?: string;
  tags?: string[];
}

// Configurações de UI
export const CLIENT_STATUS_CONFIG = {
  [ClientStatus.ACTIVE]: {
    label: 'Ativo',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    dotColor: 'bg-green-500',
  },
  [ClientStatus.INACTIVE]: {
    label: 'Inativo',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    dotColor: 'bg-gray-500',
  },
  [ClientStatus.LEAD]: {
    label: 'Lead',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    dotColor: 'bg-blue-500',
  },
  [ClientStatus.ARCHIVED]: {
    label: 'Arquivado',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    dotColor: 'bg-orange-500',
  },
};

export const CLIENT_PRIORITY_CONFIG = {
  [ClientPriority.LOW]: {
    label: 'Baixa',
    color: 'text-gray-600',
    icon: '⬇️',
  },
  [ClientPriority.NORMAL]: {
    label: 'Normal',
    color: 'text-blue-600',
    icon: '➡️',
  },
  [ClientPriority.HIGH]: {
    label: 'Alta',
    color: 'text-orange-600',
    icon: '⬆️',
  },
  [ClientPriority.URGENT]: {
    label: 'Urgente',
    color: 'text-red-600',
    icon: '🔴',
  },
};

export const INTERACTION_TYPE_CONFIG = {
  [InteractionType.CALL]: { label: 'Ligação', icon: '📞', color: 'text-blue-600' },
  [InteractionType.EMAIL]: { label: 'Email', icon: '📧', color: 'text-purple-600' },
  [InteractionType.MEETING]: { label: 'Reunião', icon: '🤝', color: 'text-green-600' },
  [InteractionType.WHATSAPP]: { label: 'WhatsApp', icon: '💬', color: 'text-green-600' },
  [InteractionType.INSTAGRAM]: { label: 'Instagram', icon: '📸', color: 'text-pink-600' },
  [InteractionType.NOTE]: { label: 'Anotação', icon: '📝', color: 'text-gray-600' },
  [InteractionType.OTHER]: { label: 'Outro', icon: '📌', color: 'text-gray-600' },
};
