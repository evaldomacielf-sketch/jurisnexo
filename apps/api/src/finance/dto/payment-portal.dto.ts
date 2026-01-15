import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, Matches, IsEmail, MaxLength, ValidateNested, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdatePaymentPortalSettingsDto {
    @ApiProperty({ example: 'Advocacia Silva', description: 'Firm Name' })
    @IsString()
    @MaxLength(200)
    firmName: string;

    @ApiProperty({ required: false, maxLength: 500 })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    logoUrl?: string;

    @ApiProperty({ example: '#000000', required: false, maxLength: 7 })
    @IsOptional()
    @IsString()
    @MaxLength(7)
    primaryColor?: string;

    @ApiProperty({ required: false, maxLength: 7 })
    @IsOptional()
    @IsString()
    @MaxLength(7)
    secondaryColor?: string;

    @ApiProperty({ example: ['pix', 'credit_card'] })
    @IsArray()
    @IsString({ each: true })
    enabledPaymentMethods: string[];

    @ApiProperty({ enum: ['stripe', 'asaas'], required: false })
    @IsOptional()
    @Matches(/^(stripe|asaas)$/)
    defaultGateway?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    stripePublicKey?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    stripeSecretKey?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    asaasApiKey?: string;

    @ApiProperty({ enum: ['sandbox', 'production'], required: false })
    @IsOptional()
    @Matches(/^(sandbox|production)$/)
    asaasEnvironment?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    webhookUrl?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    welcomeMessage?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    termsAndConditions?: string;
}

export class CreatePaymentCheckoutDto {
    @ApiProperty({ example: 'Honorários Iniciais - Caso X', description: 'Description' })
    @IsString()
    @MaxLength(200)
    description: string;

    @ApiProperty({ example: 1500.00 })
    @IsNumber()
    @Min(0.01)
    amount: number;

    @ApiProperty({ example: 'uuid', required: false, description: 'Optional Legal Fee ID' })
    @IsOptional()
    @IsUUID()
    legalFeeId?: string;

    @ApiProperty({ example: 'uuid', required: false })
    @IsOptional()
    @IsUUID()
    clientId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    expiresAt?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    payerEmail?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    payerName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    allowedPaymentMethods?: string[];
}

export class ProcessPaymentDto {
    @ApiProperty()
    @IsUUID()
    checkoutId: string;

    @ApiProperty({ enum: ['pix', 'credit_card', 'boleto'] })
    @Matches(/^(pix|credit_card|boleto)$/)
    paymentMethod: string;

    @ApiProperty({ required: false, description: 'Required for credit card' })
    @IsOptional()
    @IsString()
    cardToken?: string;

    @ApiProperty({ required: false, description: 'Required for Pix if pre-generated (unlikely)' })
    @IsOptional()
    @IsString()
    pixKey?: string;

    @ApiProperty()
    @IsString()
    @MaxLength(200)
    payerName: string;

    @ApiProperty()
    @IsEmail()
    payerEmail: string;

    @ApiProperty({ description: 'CPF (11) or CNPJ (14)' })
    @Matches(/^\d{11}$|^\d{14}$/)
    payerDocument: string;
}
