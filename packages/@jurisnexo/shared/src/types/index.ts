/**
 * Shared type definitions
 */

export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface TenantEntity extends BaseEntity {
    tenantId: string;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
