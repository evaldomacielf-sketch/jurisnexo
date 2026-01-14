
// Note: TypeORM is not installed in this project. 
// This entity is adapted to serve as a Domain Model / Interface for Supabase results.

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

export class Client {
    id: string;
    tenantId: string;

    // Dados Pessoais
    name: string;
    email: string | null;
    phone: string | null;
    cpfCnpj: string | null;
    birthDate: Date | null;

    // Endereço
    addressStreet: string | null;
    addressNumber: string | null;
    addressComplement: string | null;
    addressNeighborhood: string | null;
    addressCity: string | null;
    addressState: string | null;
    addressZipcode: string | null;

    // Status e Categorização
    status: ClientStatus;
    type: ClientType;
    source: string | null;
    priority: ClientPriority;

    // Metadata
    notes: string | null;
    tags: string[] | null;
    avatarUrl: string | null;

    // Responsável
    assignedTo: string | null;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;

    // Relations
    interactions?: ClientInteraction[];
    documents?: ClientDocument[];
}

// ============================================
// Client Interaction Entity
// ============================================

export enum InteractionType {
    CALL = 'call',
    EMAIL = 'email',
    MEETING = 'meeting',
    WHATSAPP = 'whatsapp',
    INSTAGRAM = 'instagram',
    NOTE = 'note',
    OTHER = 'other',
}

export class ClientInteraction {
    id: string;
    clientId: string;
    userId: string;
    type: InteractionType;
    subject: string | null;
    description: string;
    durationMinutes: number | null;
    outcome: string | null;
    occurredAt: Date;
    createdAt: Date;
}

// ============================================
// Client Document Entity
// ============================================

export class ClientDocument {
    id: string;
    clientId: string;
    uploadedBy: string;
    name: string;
    description: string | null;
    fileUrl: string;
    fileType: string | null;
    fileSize: number | null;
    category: string | null;
    tags: string[] | null;
    createdAt: Date;
}
