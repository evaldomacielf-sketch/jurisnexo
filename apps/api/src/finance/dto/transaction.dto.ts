import { IsString, IsNotEmpty, IsNumber, IsEnum, IsUUID, IsDateString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum TransactionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE'
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
    CASH = 'CASH',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    PIX = 'PIX',
    CHECK = 'CHECK',
    OTHER = 'OTHER'
}

export class CreateTransactionDto {
    @ApiProperty({ description: 'Descrição da transação' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ description: 'Tipo da transação', enum: TransactionType })
    @IsEnum(TransactionType)
    type: TransactionType;

    @ApiProperty({ description: 'Valor da transação' })
    @IsNumber()
    @Min(0.01)
    amount: number;

    @ApiProperty({ description: 'ID da categoria' })
    @IsUUID()
    category_id: string;

    @ApiProperty({ description: 'ID da conta bancária' })
    @IsUUID()
    bank_account_id: string;

    @ApiProperty({ description: 'Data da transação', example: '2024-01-15' })
    @IsDateString()
    transaction_date: string;

    @ApiProperty({ description: 'Método de pagamento', enum: PaymentMethod })
    @IsEnum(PaymentMethod)
    payment_method: PaymentMethod;

    @ApiPropertyOptional({ description: 'ID do caso relacionado' })
    @IsUUID()
    @IsOptional()
    case_id?: string;

    @ApiPropertyOptional({ description: 'ID do cliente relacionado' })
    @IsUUID()
    @IsOptional()
    client_id?: string;

    @ApiPropertyOptional({ description: 'Observações adicionais' })
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiPropertyOptional({ description: 'ID do documento anexado' })
    @IsUUID()
    @IsOptional()
    document_id?: string;
}

export class UpdateTransactionDto {
    @ApiPropertyOptional({ description: 'Descrição da transação' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ description: 'Tipo da transação', enum: TransactionType })
    @IsEnum(TransactionType)
    @IsOptional()
    type?: TransactionType;

    @ApiPropertyOptional({ description: 'Valor da transação' })
    @IsNumber()
    @Min(0.01)
    @IsOptional()
    amount?: number;

    @ApiPropertyOptional({ description: 'ID da categoria' })
    @IsUUID()
    @IsOptional()
    category_id?: string;

    @ApiPropertyOptional({ description: 'ID da conta bancária' })
    @IsUUID()
    @IsOptional()
    bank_account_id?: string;

    @ApiPropertyOptional({ description: 'Data da transação' })
    @IsDateString()
    @IsOptional()
    transaction_date?: string;

    @ApiPropertyOptional({ description: 'Método de pagamento', enum: PaymentMethod })
    @IsEnum(PaymentMethod)
    @IsOptional()
    payment_method?: PaymentMethod;

    @ApiPropertyOptional({ description: 'Status da transação', enum: TransactionStatus })
    @IsEnum(TransactionStatus)
    @IsOptional()
    status?: TransactionStatus;

    @ApiPropertyOptional({ description: 'Observações adicionais' })
    @IsString()
    @IsOptional()
    notes?: string;
}

export class TransactionFilterDto {
    @ApiPropertyOptional({ description: 'Filtro por tipo', enum: TransactionType })
    @IsEnum(TransactionType)
    @IsOptional()
    type?: TransactionType;

    @ApiPropertyOptional({ description: 'Filtro por status', enum: TransactionStatus })
    @IsEnum(TransactionStatus)
    @IsOptional()
    status?: TransactionStatus;

    @ApiPropertyOptional({ description: 'ID da conta bancária' })
    @IsUUID()
    @IsOptional()
    bank_account_id?: string;

    @ApiPropertyOptional({ description: 'ID da categoria' })
    @IsUUID()
    @IsOptional()
    category_id?: string;

    @ApiPropertyOptional({ description: 'Data inicial', example: '2024-01-01' })
    @IsDateString()
    @IsOptional()
    start_date?: string;

    @ApiPropertyOptional({ description: 'Data final', example: '2024-01-31' })
    @IsDateString()
    @IsOptional()
    end_date?: string;

    @ApiPropertyOptional({ description: 'Página', default: 1 })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Itens por página', default: 50 })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(1)
    limit?: number = 50;
}

export class TransactionResponseDto {
    @ApiProperty({ description: 'ID da transação' })
    id: string;

    @ApiProperty({ description: 'Descrição da transação' })
    description: string;

    @ApiProperty({ description: 'Tipo da transação', enum: TransactionType })
    type: TransactionType;

    @ApiProperty({ description: 'Valor da transação' })
    amount: number;

    @ApiProperty({ description: 'ID da categoria' })
    category_id: string;

    @ApiProperty({ description: 'ID da conta bancária' })
    bank_account_id: string;

    @ApiProperty({ description: 'Data da transação' })
    transaction_date: Date;

    @ApiProperty({ description: 'Método de pagamento', enum: PaymentMethod })
    payment_method: PaymentMethod;

    @ApiProperty({ description: 'Status da transação', enum: TransactionStatus })
    status: TransactionStatus;

    @ApiProperty({ description: 'ID do caso relacionado', nullable: true })
    case_id: string | null;

    @ApiProperty({ description: 'ID do cliente relacionado', nullable: true })
    client_id: string | null;

    @ApiProperty({ description: 'Observações', nullable: true })
    notes: string | null;

    @ApiProperty({ description: 'ID do documento anexado', nullable: true })
    document_id: string | null;

    @ApiProperty({ description: 'ID do escritório (tenant)' })
    tenant_id: string;

    @ApiProperty({ description: 'ID do usuário criador' })
    created_by: string;

    @ApiProperty({ description: 'Data de criação' })
    created_at: Date;

    @ApiProperty({ description: 'Data de atualização' })
    updated_at: Date;
}
