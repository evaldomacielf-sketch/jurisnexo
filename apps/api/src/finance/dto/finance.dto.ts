import { IsString, IsNumber, IsOptional, IsDateString, IsEnum, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Enums matching database
export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    PARTIAL = 'PARTIAL',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
    PIX = 'PIX',
    BOLETO = 'BOLETO',
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    TRANSFER = 'TRANSFER',
    CASH = 'CASH',
    OTHER = 'OTHER',
}

export enum ApprovalStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

// DTO for creating a receivable
export class CreateReceivableDto {
    @ApiPropertyOptional({ description: 'Client UUID if exists in system' })
    @IsOptional()
    @IsUUID()
    client_id?: string;

    @ApiPropertyOptional({ description: 'Client name for display' })
    @IsOptional()
    @IsString()
    client_name?: string;

    @ApiPropertyOptional({ description: 'CPF or CNPJ' })
    @IsOptional()
    @IsString()
    client_document?: string;

    @ApiPropertyOptional({ description: 'Case UUID if linked to a case' })
    @IsOptional()
    @IsUUID()
    case_id?: string;

    @ApiProperty({ description: 'Description of the receivable' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'Amount in BRL', example: 1500.00 })
    @IsNumber()
    @Min(0.01)
    amount: number;

    @ApiProperty({ description: 'Due date in ISO format', example: '2026-02-15' })
    @IsDateString()
    due_date: string;

    @ApiPropertyOptional({ enum: PaymentMethod })
    @IsOptional()
    @IsEnum(PaymentMethod)
    payment_method?: PaymentMethod;

    @ApiPropertyOptional({ description: 'Category UUID' })
    @IsOptional()
    @IsUUID()
    category_id?: string;

    @ApiPropertyOptional({ description: 'Recurrence type', enum: ['ONCE', 'MONTHLY', 'YEARLY'] })
    @IsOptional()
    @IsString()
    recurrence_type?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}

// DTO for recording a payment on a receivable
export class RecordPaymentDto {
    @ApiProperty({ description: 'Amount being paid', example: 500.00 })
    @IsNumber()
    @Min(0.01)
    amount: number;

    @ApiPropertyOptional({ description: 'Payment date (defaults to today)' })
    @IsOptional()
    @IsDateString()
    payment_date?: string;

    @ApiPropertyOptional({ enum: PaymentMethod })
    @IsOptional()
    @IsEnum(PaymentMethod)
    payment_method?: PaymentMethod;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}

// DTO for creating a payable
export class CreatePayableDto {
    @ApiProperty({ description: 'Supplier/Vendor name' })
    @IsString()
    supplier_name: string;

    @ApiPropertyOptional({ description: 'Supplier CPF/CNPJ' })
    @IsOptional()
    @IsString()
    supplier_document?: string;

    @ApiProperty({ description: 'Description of the expense' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'Amount in BRL', example: 250.00 })
    @IsNumber()
    @Min(0.01)
    amount: number;

    @ApiProperty({ description: 'Due date in ISO format', example: '2026-02-20' })
    @IsDateString()
    due_date: string;

    @ApiPropertyOptional({ enum: PaymentMethod })
    @IsOptional()
    @IsEnum(PaymentMethod)
    payment_method?: PaymentMethod;

    @ApiPropertyOptional({ description: 'Category UUID' })
    @IsOptional()
    @IsUUID()
    category_id?: string;

    @ApiPropertyOptional({ description: 'Bank account UUID for payment' })
    @IsOptional()
    @IsUUID()
    account_id?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}

// DTO for approving/rejecting a payable
export class ApprovePayableDto {
    @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
    @IsEnum(ApprovalStatus)
    status: ApprovalStatus.APPROVED | ApprovalStatus.REJECTED;

    @ApiPropertyOptional({ description: 'Required if status is REJECTED' })
    @IsOptional()
    @IsString()
    rejection_reason?: string;
}

// Query DTO for filtering receivables/payables
export class FinanceQueryDto {
    @ApiPropertyOptional({ enum: PaymentStatus })
    @IsOptional()
    @IsEnum(PaymentStatus)
    status?: PaymentStatus;

    @ApiPropertyOptional({ description: 'Filter by due date from' })
    @IsOptional()
    @IsDateString()
    due_date_from?: string;

    @ApiPropertyOptional({ description: 'Filter by due date to' })
    @IsOptional()
    @IsDateString()
    due_date_to?: string;

    @ApiPropertyOptional({ description: 'Filter by client ID' })
    @IsOptional()
    @IsUUID()
    client_id?: string;

    @ApiPropertyOptional({ description: 'Filter by category ID' })
    @IsOptional()
    @IsUUID()
    category_id?: string;

    @ApiPropertyOptional({ description: 'Page number', default: 1 })
    @IsOptional()
    @IsNumber()
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Items per page', default: 20 })
    @IsOptional()
    @IsNumber()
    limit?: number = 20;
}

// Dashboard KPIs response
export class DashboardKpisDto {
    @ApiProperty()
    total_receivables: number;

    @ApiProperty()
    total_received: number;

    @ApiProperty()
    total_overdue: number;

    @ApiProperty()
    total_payables: number;

    @ApiProperty()
    total_paid: number;

    @ApiProperty()
    cash_flow_balance: number;

    @ApiProperty()
    overdue_count: number;

    @ApiProperty()
    pending_approval_count: number;
}
