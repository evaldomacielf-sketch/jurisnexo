import { IsString, IsEmail, IsOptional, IsEnum, IsArray, IsDateString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ClientStatus, ClientType, ClientPriority } from '../entities/client.entity';

export class CreateClientDto {
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    name: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    cpfCnpj?: string;

    @IsDateString()
    @IsOptional()
    birthDate?: string;

    // Endereço
    @IsString()
    @IsOptional()
    addressStreet?: string;

    @IsString()
    @IsOptional()
    addressNumber?: string;

    @IsString()
    @IsOptional()
    addressComplement?: string;

    @IsString()
    @IsOptional()
    addressNeighborhood?: string;

    @IsString()
    @IsOptional()
    addressCity?: string;

    @IsString()
    @IsOptional()
    addressState?: string;

    @IsString()
    @IsOptional()
    addressZipcode?: string;

    // Status
    @IsEnum(ClientStatus)
    @IsOptional()
    status?: ClientStatus;

    @IsEnum(ClientType)
    @IsOptional()
    type?: ClientType;

    @IsString()
    @IsOptional()
    source?: string;

    @IsEnum(ClientPriority)
    @IsOptional()
    priority?: ClientPriority;

    // Metadata
    @IsString()
    @IsOptional()
    notes?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsUUID()
    @IsOptional()
    assignedTo?: string;
}

export class UpdateClientDto extends CreateClientDto { }

// ============================================
// Interaction DTOs
// ============================================

export class CreateInteractionDto {
    @IsUUID()
    clientId: string;

    @IsEnum(['call', 'email', 'meeting', 'whatsapp', 'instagram', 'note', 'other'])
    type: string;

    @IsString()
    @IsOptional()
    subject?: string;

    @IsString()
    @MinLength(1)
    description: string;

    @IsOptional()
    durationMinutes?: number;

    @IsString()
    @IsOptional()
    outcome?: string;

    @IsDateString()
    @IsOptional()
    occurredAt?: string;
}

// ============================================
// Document DTOs
// ============================================

export class CreateDocumentDto {
    @IsUUID()
    clientId: string;

    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    fileUrl: string;

    @IsString()
    @IsOptional()
    fileType?: string;

    @IsOptional()
    fileSize?: number;

    @IsString()
    @IsOptional()
    category?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];
}
