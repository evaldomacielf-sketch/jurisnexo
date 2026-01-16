import type { PaginatedResponse } from '@/types/common';

export enum CaseStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

export interface Case {
  id: string;
  tenant_id: string;
  case_number?: string;
  title: string;
  description?: string;
  status: CaseStatus;
  practice_area?: string;
  is_urgent: boolean;
  client?: {
    id: string;
    name: string;
    phone?: string;
  };
  responsible_lawyer?: {
    id: string;
    name: string;
    email: string;
  };
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CaseFilters {
  status?: CaseStatus;
  search?: string;
  practice_area?: string;
  client_id?: string;
  lawyer_id?: string;
  is_urgent?: boolean;
  page?: number;
  limit?: number;
}

export type CreateCaseData = Omit<Case, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>;
export type UpdateCaseData = Partial<CreateCaseData>;

export interface CaseEvent {
  id: string;
  case_id: string;
  type: CaseEventType;
  title: string;
  description?: string;
  event_date: string;
  created_by: string;
  created_at: string;
}

export type CaseEventType =
  | 'hearing'
  | 'deadline'
  | 'document_filed'
  | 'status_change'
  | 'note'
  | 'other';

export type CreateCaseEventData = Omit<CaseEvent, 'id' | 'created_at'>;

export type PaginatedCases = PaginatedResponse<Case>;
