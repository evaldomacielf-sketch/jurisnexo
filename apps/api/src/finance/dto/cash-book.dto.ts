import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCashBookEntryDto {
    @ApiProperty({ example: 'uuid', description: 'Transaction ID' })
    @IsUUID()
    transactionId: string;

    @ApiProperty({ example: 'Aluguel', description: 'Fiscal Category' })
    @IsString()
    fiscalCategory: string;

    @ApiProperty({ example: true, description: 'Is Deductible?' })
    @IsBoolean()
    isDeductible: boolean;

    @ApiProperty({ example: 100, description: 'Deductible Percentage (0-100)' })
    @IsNumber()
    @Min(0)
    @Max(100)
    deductiblePercentage: number;

    @ApiProperty({ example: '2026-01-01', description: 'Competence Date (Month/Year)' })
    @IsDateString()
    fiscalCompetenceDate: string;

    @ApiProperty({ example: 'Comprovante em anexo', required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ example: 'https://s3...', required: false })
    @IsOptional()
    @IsString()
    proofUrl?: string;
}

export class UpdateCashBookEntryDto {
    @ApiProperty({ example: 'Aluguel', required: false })
    @IsOptional()
    @IsString()
    fiscalCategory?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isDeductible?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    deductiblePercentage?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    fiscalCompetenceDate?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    proofUrl?: string;
}

export class CashBookCategoryDto {
    @ApiProperty()
    category: string;

    @ApiProperty()
    amount: number;

    @ApiProperty()
    deductibleAmount: number;

    @ApiProperty()
    transactionCount: number;
}

export class CashBookMonthlyDto {
    @ApiProperty()
    month: number;

    @ApiProperty()
    monthName: string;

    @ApiProperty()
    income: number;

    @ApiProperty()
    expenses: number;

    @ApiProperty()
    deductibleExpenses: number;

    @ApiProperty()
    netIncome: number;
}

export class CashBookReportDto {
    @ApiProperty()
    year: number;

    @ApiProperty()
    totalIncome: number;

    @ApiProperty()
    totalExpenses: number;

    @ApiProperty()
    totalDeductibleExpenses: number;

    @ApiProperty()
    netIncome: number;

    @ApiProperty({ type: [CashBookCategoryDto] })
    incomeByCategory: CashBookCategoryDto[];

    @ApiProperty({ type: [CashBookCategoryDto] })
    expensesByCategory: CashBookCategoryDto[];

    @ApiProperty({ type: [CashBookMonthlyDto] })
    monthlyBreakdown: CashBookMonthlyDto[];
}
