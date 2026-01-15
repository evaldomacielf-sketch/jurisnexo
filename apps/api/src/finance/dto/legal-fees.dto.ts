import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, IsDateString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum FeeType {
    HOURLY = 'hourly',
    FIXED = 'fixed',
    CONTINGENCY = 'contingency',
    SUCCESS_FEE = 'success_fee',
    RETAINER = 'retainer',
}

export class CreateLegalFeeDto {
    @ApiProperty({ example: 'uuid', description: 'Client ID' })
    @IsUUID()
    clientId: string;

    @ApiProperty({ example: 'uuid', description: 'Case ID', required: false })
    @IsOptional()
    @IsUUID()
    caseId?: string;

    @ApiProperty({ example: 'Honorários Processo 123', description: 'Description' })
    @IsString()
    description: string;

    @ApiProperty({ enum: FeeType, example: FeeType.FIXED })
    @IsEnum(FeeType)
    feeType: FeeType;

    @ApiProperty({ example: 5000.00, description: 'Contracted Amount' })
    @IsNumber()
    @Min(0.01)
    contractedAmount: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @ApiProperty({ example: { installments: 3 }, description: 'Configuration JSON', required: false })
    @IsOptional()
    @IsObject()
    paymentConfiguration?: any;
}

export class UpdateLegalFeeDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false, enum: FeeType })
    @IsOptional()
    @IsEnum(FeeType)
    feeType?: FeeType;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0.01)
    contractedAmount?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    caseCosts?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsObject()
    paymentConfiguration?: any;
}

export class RecordFeePaymentDto {
    @ApiProperty({ description: 'Legal Fee ID' })
    @IsUUID()
    legalFeeId: string;

    @ApiProperty({ description: 'Amount being paid' })
    @IsNumber()
    @Min(0.01)
    amount: number;

    @ApiProperty({ description: 'Payment method' })
    @IsString()
    paymentMethod: string;

    @ApiProperty({ description: 'Payment date' })
    @IsDateString()
    paymentDate: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    gatewayTransactionId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    gateway?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class LegalFeeProfitabilityDto {
    @ApiProperty()
    legalFeeId: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    clientName: string;

    @ApiProperty()
    contractedAmount: number;

    @ApiProperty()
    paidAmount: number;

    @ApiProperty()
    caseCosts: number;

    @ApiProperty()
    netProfit: number;

    @ApiProperty()
    profitMargin: number;

    @ApiProperty()
    paymentStatus: string;

    @ApiProperty()
    daysOverdue: number;
}
