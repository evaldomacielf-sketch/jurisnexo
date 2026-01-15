import {
    IsNumber,
    IsUUID,
    IsNotEmpty,
    IsOptional,
    IsInt,
    Min,
    Max,
    IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBudgetDto {
    @ApiProperty({ description: 'ID da categoria' })
    @IsUUID()
    @IsNotEmpty()
    category_id: string;

    @ApiProperty({ description: 'Ano do orçamento', example: 2024 })
    @IsInt()
    @Min(2000)
    @Max(2100)
    year: number;

    @ApiProperty({ description: 'Mês do orçamento (1-12)', example: 1 })
    @IsInt()
    @Min(1)
    @Max(12)
    month: number;

    @ApiProperty({ description: 'Valor planejado', minimum: 0 })
    @IsNumber()
    @Min(0)
    planned_amount: number;

    @ApiProperty({ description: 'Observações' })
    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdateBudgetDto {
    @ApiProperty({ description: 'Valor planejado', minimum: 0 })
    @IsNumber()
    @Min(0)
    @IsOptional()
    planned_amount?: number;

    @ApiProperty({ description: 'Observações' })
    @IsString()
    @IsOptional()
    notes?: string;
}

export class BudgetResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    category_id: string;

    @ApiProperty()
    category_name?: string;

    @ApiProperty()
    year: number;

    @ApiProperty()
    month: number;

    @ApiProperty()
    planned_amount: number;

    @ApiProperty({ required: false })
    notes?: string;

    @ApiProperty()
    created_at: Date;
}
