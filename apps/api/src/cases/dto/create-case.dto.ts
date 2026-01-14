import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';

export class CreateCaseDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(['active', 'pending', 'closed', 'archived'])
    @IsOptional()
    status?: 'active' | 'pending' | 'closed' | 'archived';

    @IsEnum(['low', 'medium', 'high', 'urgent'])
    @IsOptional()
    priority?: 'low' | 'medium' | 'high' | 'urgent';

    @IsString()
    @IsOptional()
    case_number?: string;

    @IsString()
    @IsOptional()
    practice_area?: string;

    @IsString()
    @IsOptional()
    client_id?: string;

    @IsString()
    @IsOptional()
    responsible_lawyer_id?: string;

    @IsBoolean()
    @IsOptional()
    is_urgent?: boolean;

    @IsNumber()
    @IsOptional()
    value?: number;

    @IsString()
    @IsOptional()
    court?: string;

    @IsString()
    @IsOptional()
    judge?: string;
}
