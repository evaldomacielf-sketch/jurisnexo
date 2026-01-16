export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}

export interface ApiError {
    message: string;
    code?: string;
    details?: Record<string, any>;
}
