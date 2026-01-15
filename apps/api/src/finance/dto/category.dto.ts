import { IsString, IsNotEmpty, IsOptional, IsEnum, IsHexColor } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CategoryType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
    BOTH = 'BOTH'
}

export class CreateCategoryDto {
    @ApiProperty({ description: 'Nome da categoria' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Tipo da categoria', enum: CategoryType })
    @IsEnum(CategoryType)
    type: CategoryType;

    @ApiPropertyOptional({ description: 'Descrição da categoria' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ description: 'Cor da categoria (hex)', example: '#3B82F6' })
    @IsHexColor()
    @IsOptional()
    color?: string;

    @ApiPropertyOptional({ description: 'Ícone da categoria', example: 'IconCash' })
    @IsString()
    @IsOptional()
    icon?: string;
}

export class UpdateCategoryDto {
    @ApiPropertyOptional({ description: 'Nome da categoria' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ description: 'Tipo da categoria', enum: CategoryType })
    @IsEnum(CategoryType)
    @IsOptional()
    type?: CategoryType;

    @ApiPropertyOptional({ description: 'Descrição da categoria' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ description: 'Cor da categoria (hex)' })
    @IsHexColor()
    @IsOptional()
    color?: string;

    @ApiPropertyOptional({ description: 'Ícone da categoria' })
    @IsString()
    @IsOptional()
    icon?: string;
}

export class CategoryResponseDto {
    @ApiProperty({ description: 'ID da categoria' })
    id: string;

    @ApiProperty({ description: 'Nome da categoria' })
    name: string;

    @ApiProperty({ description: 'Tipo da categoria', enum: CategoryType })
    type: CategoryType;

    @ApiProperty({ description: 'Descrição da categoria', nullable: true })
    description: string | null;

    @ApiProperty({ description: 'Cor da categoria (hex)' })
    color: string;

    @ApiProperty({ description: 'Ícone da categoria', nullable: true })
    icon: string | null;

    @ApiProperty({ description: 'ID do escritório (tenant)' })
    tenant_id: string;

    @ApiProperty({ description: 'Data de criação' })
    created_at: Date;

    @ApiProperty({ description: 'Data de atualização' })
    updated_at: Date;
}
