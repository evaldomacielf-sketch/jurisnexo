import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsUUID, IsBoolean, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ============================================
// Event Types & Enums
// ============================================

export enum EventType {
    AUDIENCIA = 'audiencia',
    REUNIAO = 'reuniao',
    PRAZO = 'prazo',
    CONSULTA = 'consulta',
    DEPOIMENTO = 'depoimento',
    PERICIA = 'pericia',
    MEDIACAO = 'mediacao',
    OUTRO = 'outro',
}

export enum RecurrenceType {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
}

export enum ReminderType {
    EMAIL = 'email',
    NOTIFICATION = 'notification',
    SMS = 'sms',
    WHATSAPP = 'whatsapp',
}

// ============================================
// Create Event DTO
// ============================================

export class ReminderDto {
    @ApiProperty({ enum: ReminderType })
    @IsEnum(ReminderType)
    type: ReminderType;

    @ApiProperty({ description: 'Minutos antes do evento para enviar lembrete' })
    minutesBefore: number;
}

export class RecurrenceDto {
    @ApiProperty({ enum: RecurrenceType })
    @IsEnum(RecurrenceType)
    type: RecurrenceType;

    @ApiPropertyOptional({ description: 'Intervalo (a cada N dias/semanas/meses)' })
    interval?: number;

    @ApiPropertyOptional({ description: 'Data final da recorrência' })
    @IsDateString()
    @IsOptional()
    endDate?: string;

    @ApiPropertyOptional({ description: 'Número máximo de ocorrências' })
    count?: number;
}

export class CreateEventDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ enum: EventType })
    @IsEnum(EventType)
    type: EventType;

    @ApiProperty()
    @IsDateString()
    startDate: string;

    @ApiProperty()
    @IsDateString()
    endDate: string;

    @ApiPropertyOptional({ default: false })
    @IsBoolean()
    @IsOptional()
    allDay?: boolean;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    location?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    videoLink?: string;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    caseId?: string;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    clientId?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsUUID('4', { each: true })
    @IsOptional()
    participantIds?: string[];

    @ApiPropertyOptional({ type: [ReminderDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReminderDto)
    @IsOptional()
    reminders?: ReminderDto[];

    @ApiPropertyOptional({ type: RecurrenceDto })
    @ValidateNested()
    @Type(() => RecurrenceDto)
    @IsOptional()
    recurrence?: RecurrenceDto;

    @ApiPropertyOptional({ description: 'Cor do evento no calendário' })
    @IsString()
    @IsOptional()
    color?: string;

    @ApiPropertyOptional({ default: false, description: 'Sincronizar com Google Calendar' })
    @IsBoolean()
    @IsOptional()
    syncWithGoogle?: boolean;
}

export class UpdateEventDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ enum: EventType })
    @IsEnum(EventType)
    @IsOptional()
    type?: EventType;

    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    endDate?: string;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    allDay?: boolean;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    location?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    videoLink?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsUUID('4', { each: true })
    @IsOptional()
    participantIds?: string[];

    @ApiPropertyOptional({ type: [ReminderDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReminderDto)
    @IsOptional()
    reminders?: ReminderDto[];

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    color?: string;
}

// ============================================
// Response DTOs
// ============================================

export class EventResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    title: string;

    @ApiPropertyOptional()
    description?: string;

    @ApiProperty({ enum: EventType })
    type: EventType;

    @ApiProperty()
    startDate: string;

    @ApiProperty()
    endDate: string;

    @ApiProperty()
    allDay: boolean;

    @ApiPropertyOptional()
    location?: string;

    @ApiPropertyOptional()
    videoLink?: string;

    @ApiPropertyOptional()
    caseId?: string;

    @ApiPropertyOptional()
    clientId?: string;

    @ApiProperty()
    participantIds: string[];

    @ApiProperty()
    reminders: ReminderDto[];

    @ApiPropertyOptional()
    recurrence?: RecurrenceDto;

    @ApiPropertyOptional()
    color?: string;

    @ApiPropertyOptional()
    googleEventId?: string;

    @ApiProperty()
    createdAt: string;

    @ApiProperty()
    updatedAt: string;
}

// ============================================
// Google Calendar DTOs
// ============================================

export class GoogleCalendarAuthDto {
    @ApiProperty()
    @IsString()
    code: string;
}

export class GoogleCalendarSyncDto {
    @ApiProperty({ description: 'Data inicial para sincronização' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ description: 'Data final para sincronização' })
    @IsDateString()
    endDate: string;
}
