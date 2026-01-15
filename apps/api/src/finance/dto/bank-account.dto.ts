import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AccountType {
    CHECKING = 'CHECKING',
    SAVINGS = 'SAVINGS',
    INVESTMENT = 'INVESTMENT',
    CREDIT_CARD = 'CREDIT_CARD'
}

export class CreateBankAccountDto {
    @ApiProperty({ description: 'Nome da conta bancária' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Nome do banco' })
    @IsString()
    @IsNotEmpty()
    bank_name: string;

    @ApiPropertyOptional({ description: 'Número da agência' })
    @IsString()
    @IsOptional()
    agency?: string;

    @ApiProperty({ description: 'Número da conta' })
    @IsString()
    @IsNotEmpty()
    account_number: string;

    @ApiProperty({ description: 'Tipo da conta', enum: AccountType })
    @IsEnum(AccountType)
    account_type: AccountType;

    @ApiPropertyOptional({ description: 'Saldo inicial', default: 0 })
    @IsNumber()
    @IsOptional()
    initial_balance?: number;

    @ApiPropertyOptional({ description: 'Conta ativa', default: true })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}

export class UpdateBankAccountDto {
    @ApiPropertyOptional({ description: 'Nome da conta bancária' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ description: 'Nome do banco' })
    @IsString()
    @IsOptional()
    bank_name?: string;

    @ApiPropertyOptional({ description: 'Número da agência' })
    @IsString()
    @IsOptional()
    agency?: string;

    @ApiPropertyOptional({ description: 'Número da conta' })
    @IsString()
    @IsOptional()
    account_number?: string;

    @ApiPropertyOptional({ description: 'Tipo da conta', enum: AccountType })
    @IsEnum(AccountType)
    @IsOptional()
    account_type?: AccountType;

    @ApiPropertyOptional({ description: 'Conta ativa' })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}

export class BankAccountResponseDto {
    @ApiProperty({ description: 'ID da conta' })
    id: string;

    @ApiProperty({ description: 'Nome da conta bancária' })
    name: string;

    @ApiProperty({ description: 'Nome do banco' })
    bank_name: string;

    @ApiProperty({ description: 'Número da agência', nullable: true })
    agency: string | null;

    @ApiProperty({ description: 'Número da conta' })
    account_number: string;

    @ApiProperty({ description: 'Tipo da conta', enum: AccountType })
    account_type: AccountType;

    @ApiProperty({ description: 'Saldo atual' })
    current_balance: number;

    @ApiProperty({ description: 'Conta ativa' })
    is_active: boolean;

    @ApiProperty({ description: 'ID do escritório (tenant)' })
    tenant_id: string;

    @ApiProperty({ description: 'Data de criação' })
    created_at: Date;

    @ApiProperty({ description: 'Data de atualização' })
    updated_at: Date;
}
