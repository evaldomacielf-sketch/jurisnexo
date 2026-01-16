import type { PaginatedResponse } from './common';

export interface Contact {
  id: string;
  tenant_id: string;
  name: string;
  email?: string;
  phone: string;
  cpf?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  source: ContactSource;
  tags?: string[];
  notes?: string;
  is_lead: boolean;
  created_at: string;
  updated_at: string;
}

export type ContactSource = 'whatsapp' | 'website' | 'referral' | 'other';

export interface ContactFilters {
  search?: string;
  source?: ContactSource;
  is_lead?: boolean;
  tags?: string[];
  page?: number;
  limit?: number;
}

export type CreateContactData = Omit<Contact, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>;
export type UpdateContactData = Partial<CreateContactData>;

export interface Interaction {
  id: string;
  contact_id: string;
  type: InteractionType;
  content?: string;
  created_at: string;
  user?: {
    id: string;
    name: string;
  };
  metadata?: Record<string, any>;
}

export type InteractionType = 'whatsapp' | 'call' | 'email' | 'meeting' | 'note';

export type CreateInteractionData = Omit<Interaction, 'id' | 'created_at' | 'user'>;

export interface Document {
  id: string;
  contact_id: string;
  name: string;
  url: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
  uploaded_by: string;
}
