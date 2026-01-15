import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, IsNumber, Min, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SplitType {
    PERCENTAGE = 'percentage',
    FIXED = 'fixed',
    PROGRESSIVE = 'progressive',
}

export class CreateFeeSplitRuleDto {
    @ApiProperty({ example: 'Regra Sócios', description: 'Rule Name' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'Divisão 50/50 entre sócios', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ enum: SplitType, example: SplitType.PERCENTAGE })
    @IsEnum(SplitType)
    splitType: SplitType;

    @ApiProperty({ example: true })
    @IsBoolean()
    isAutomatic: boolean;

    @ApiProperty({
        example: { splits: [{ lawyer_id: 'uuid', percentage: 50 }, { lawyer_id: 'uuid2', percentage: 50 }] },
        description: 'Configuration JSON'
    })
    @IsObject()
    configuration: any;
}

export class UpdateFeeSplitRuleDto {
    @ApiProperty({ example: 'Regra Sócios', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isAutomatic?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsObject()
    configuration?: any;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class CreateFeeSplitTransactionDto {
    @ApiProperty()
    @IsUUID()
    ruleId: string;

    @ApiProperty()
    @IsUUID()
    feeTransactionId: string;

    @ApiProperty()
    @IsNumber()
    @Min(0.01)
    totalAmount: number;

    @ApiProperty()
    @IsDateString()
    splitDate: string;
}

export class ApproveFeeSplitDto {
    @ApiProperty()
    @IsUUID()
    transactionId: string;
}

export class FeeSplitItemDto {
    @ApiProperty()
    transactionId: string;

    @ApiProperty()
    date: string;

    @ApiProperty()
    caseDescription: string;

    @ApiProperty()
    amount: number;

    @ApiProperty()
    percentage: number;

    @ApiProperty()
    status: string;
}

export class FeeSplitExtractDto {
    @ApiProperty()
    lawyerId: string;

    @ApiProperty()
    lawyerName: string;

    @ApiProperty()
    periodStart: string;

    @ApiProperty()
    periodEnd: string;

    @ApiProperty()
    totalAmount: number;

    @ApiProperty()
    transactionCount: number;

    @ApiProperty({ type: [FeeSplitItemDto] })
    items: FeeSplitItemDto[];
}
