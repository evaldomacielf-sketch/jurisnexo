// Lead Management Types

export type LeadStatus =
    | 'New'
    | 'Qualifying'
    | 'Qualified'
    | 'Assigned'
    | 'Contacted'
    | 'Negotiating'
    | 'Won'
    | 'Lost'
    | 'Spam';

export type LeadQuality = 'High' | 'Medium' | 'Low';

export type LeadSource = 'WhatsApp' | 'Website' | 'Facebook' | 'Google' | 'Indicacao';

export type LeadUrgency = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Lead {
    id: string;
    name: string;
    phoneNumber: string;
    email?: string;
    status: LeadStatus;
    source: LeadSource;
    score: number;
    quality: LeadQuality;
    caseType?: string;
    caseDescription?: string;
    urgency: LeadUrgency;
    city?: string;
    state?: string;
    assignedToUserId?: string;
    assignedToUserName?: string;
    assignedAt?: string;
    convertedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LeadDto {
    id: string;
    name: string;
    phoneNumber: string;
    status: string;
    source: string;
    score: number;
    quality: string;
    caseType?: string;
    urgency: string;
    city?: string;
    assignedToUserName?: string;
    assignedAt?: string;
    convertedAt?: string;
}

export interface LeadDetailsDto extends LeadDto {
    email?: string;
    caseDescription?: string;
    state?: string;
    answers: LeadAnswerDto[];
    scoreHistory: LeadScoreDto[];
    followUpTasks: LeadFollowUpDto[];
}

export interface LeadAnswerDto {
    questionId: string;
    questionText: string;
    answerText: string;
}

export interface LeadScoreDto {
    scoreValue: number;
    reason: string;
    scoredAt: string;
}

export interface LeadFollowUpDto {
    id: string;
    taskDescription: string;
    dueDate: string;
    isCompleted: boolean;
}

export interface LeadFunnel {
    captured?: number;
    new: number;
    qualifying: number;
    qualified: number;
    contacted?: number;
    negotiating?: number;
    converted: number;
    lost: number;
    conversionRate: number;
}

export interface LeadMetrics {
    totalLeads: number;
    convertedCount: number;
    averageResponseTimeMinutes: number;
    qualifiedLeads?: number;
    newLeadsToday?: number;
    qualifiedLeadsToday?: number;
    conversionRateMonth?: number;
    // Trends
    leadsTrend?: string;
    leadsTrendDirection?: 'up' | 'down';
    conversionTrend?: string;
    conversionTrendDirection?: 'up' | 'down';
    responseTimeTrend?: string;
    responseTimeTrendDirection?: 'up' | 'down';
    qualifiedTrend?: string;
    qualifiedTrendDirection?: 'up' | 'down';
}

export interface LeadFilters {
    quality?: string | null;
    caseType?: string | null;
    assignedTo?: string | null;
    status?: LeadStatus | null;
    dateFrom?: string | null;
    dateTo?: string | null;
    search?: string | null;
}

export interface PagedLeadsResponse {
    items: LeadDto[];
    totalCount: number;
    page: number;
    pageSize: number;
}
