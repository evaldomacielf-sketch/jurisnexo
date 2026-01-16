export interface LivroCaixaEntry {
    id: string;
    escritorio_id: string;
    tipo: 'receita' | 'despesa';
    categoria: string;
    descricao: string;
    valor: number;
    data_lancamento: Date;
    processo_id?: string;
    cliente_id?: string;
    advogado_responsavel_id?: string;
    forma_pagamento: string;
    dedutivel_ir: boolean;
    comprovante_url?: string;
    observacoes?: string;
    created_at: Date;
    updated_at: Date;
}

// Types para Fee Split
export interface RegraFeeSplit {
    id: string;
    escritorio_id: string;
    nome: string;
    tipo_divisao: 'percentual' | 'fixo' | 'progressivo';
    advogados: AdvogadoFeeSplit[];
    status: 'ativa' | 'inativa';
    aplicacao_automatica: boolean;
    criterios_aplicacao?: any;
    created_at: Date;
}

export interface AdvogadoFeeSplit {
    advogado_id: string;
    percentual?: number;
    valor_fixo?: number;
    condicoes_progressivas?: CondicaoProgressiva[];
}

export interface CondicaoProgressiva {
    min_valor: number;
    max_valor?: number;
    percentual: number;
}

export interface DivisaoHonorario {
    id: string;
    honorario_id: string;
    advogado_id: string;
    valor_devido: number;
    valor_pago: number;
    data_pagamento?: Date;
    status: 'pendente' | 'pago' | 'cancelado';
}

// Types para Gestão de Honorários
export interface Honorario {
    id: string;
    escritorio_id: string;
    processo_id?: string;
    cliente_id: string;
    cliente?: {
        id: string;
        nome: string;
        email?: string;
    };
    tipo: 'fixo' | 'hora' | 'exito' | 'hibrido';
    descricao: string;
    valor_total: number;
    valor_pago: number;
    valor_pendente: number;
    data_vencimento?: Date;
    forma_pagamento?: string;
    observacoes?: string;
    status: 'pendente' | 'pago' | 'parcial_pago' | 'atrasado' | 'cancelado';
    status_pagamento?: 'pendente' | 'parcial' | 'pago' | 'atrasado';
    created_at: Date;
}

// Types para Portal de Pagamento
export interface CheckoutSession {
    id: string;
    escritorio_id: string;
    cliente_id: string;
    honorario_id?: string;
    valor: number;
    gateway: 'stripe' | 'asaas';
    checkout_url?: string;
    qr_code_pix?: string;
    expira_em?: Date;
    created_at: Date;
}

// Types para API Responses
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
