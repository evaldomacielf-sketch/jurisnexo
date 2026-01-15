import {
    IsString,
    IsNumber,
    IsUUID,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    IsBoolean,
    IsDateString,
    Min,
    Max,
    IsInt,
    ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RecurrenceFrequency {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    YEARLY = 'YEARLY',
}

export enum TransactionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
}

export enum PaymentMethod {
    CASH = 'CASH',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    PIX = 'PIX',
    CHECK = 'CHECK',
    OTHER = 'OTHER',
}

export class CreateRecurringTransactionDto {
    @ApiProperty({ description: 'Descrição da transação recorrente' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ enum: TransactionType })
    @IsEnum(TransactionType)
    type: TransactionType;

    @ApiProperty({ description: 'Valor da transação', minimum: 0.01 })
    @IsNumber()
    @Min(0.01)
    amount: number;

    @ApiProperty({ description: 'ID da categoria' })
    @IsUUID()
    category_id: string;

    @ApiProperty({ description: 'ID da conta bancária' })
    @IsUUID()
    account_id: string;

    @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.BANK_TRANSFER })
    @IsEnum(PaymentMethod)
    @IsOptional()
    payment_method?: PaymentMethod;

    @ApiProperty({ enum: RecurrenceFrequency })
    @IsEnum(RecurrenceFrequency)
    frequency: RecurrenceFrequency;

    @ApiProperty({ description: 'Data de início da recorrência' })
    @IsDateString()
    start_date: string;

    @ApiProperty({ description: 'Data de término da recorrência (opcional)' })
    @IsDateString()
    @IsOptional()
    end_date?: string;

    @ApiProperty({ description: 'Dia do mês para recorrência mensal (1-31)', minimum: 1, maximum: 31 })
    @IsInt()
    @Min(1)
    @Max(31)
    @ValidateIf((o) => o.frequency === RecurrenceFrequency.MONTHLY)
    @IsOptional()
    day_of_month?: number;

    @ApiProperty({ description: 'Observações' })
    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdateRecurringTransactionDto {
    @ApiProperty({ description: 'Descrição da transação recorrente' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'Valor da transação', minimum: 0.01 })
    @IsNumber()
    @Min(0.01)
    @IsOptional()
    amount?: number;

    @ApiProperty({ description: 'ID da categoria' })
    @IsUUID()
    @IsOptional()
    category_id?: string;

    @ApiProperty({ description: 'ID da conta bancária' })
    @IsUUID()
    @IsOptional()
    account_id?: string;

    @ApiProperty({ enum: PaymentMethod })
    @IsEnum(PaymentMethod)
    @IsOptional()
    payment_method?: PaymentMethod;

    @ApiProperty({ enum: RecurrenceFrequency })
    @IsEnum(RecurrenceFrequency)
    @IsOptional()
    frequency?: RecurrenceFrequency;

    @ApiProperty({ description: 'Data de término da recorrência' })
    @IsDateString()
    @IsOptional()
    end_date?: string;

    @ApiProperty({ description: 'Dia do mês para recorrência mensal (1-31)' })
    @IsInt()
    @Min(1)
    @Max(31)
    @ValidateIf((o) => o.frequency === RecurrenceFrequency.MONTHLY)
    @IsOptional()
    day_of_month?: number;

    @ApiProperty({ description: 'Se a recorrência está ativa' })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;

    @ApiProperty({ description: 'Observações' })
    @IsString()
    @IsOptional()
    notes?: string;
}

export class RecurringTransactionResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    description: string;

    @ApiProperty({ enum: TransactionType })
    type: TransactionType;

    @ApiProperty()
    amount: number;

    @ApiProperty({ enum: RecurrenceFrequency })
    frequency: RecurrenceFrequency;

    @ApiProperty()
    start_date: string;

    @ApiProperty({ required: false })
    end_date?: string;

    @ApiProperty()
    is_active: boolean;

    @ApiProperty({ required: false })
    last_generated_date?: string;

    @ApiProperty()
    created_at: Date;
}
