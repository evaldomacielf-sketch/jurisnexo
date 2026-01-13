import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail({}, { message: 'Email inválido' })
    email: string;

    @ApiProperty({ example: 'My Company Name', minLength: 3 })
    @IsString()
    @MinLength(3, { message: 'Nome da empresa deve ter no mínimo 3 caracteres' })
    tenantName: string;

    @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
    @IsString()
    @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Senha deve conter letra maiúscula, minúscula e número/símbolo',
    })
    password: string;

    @ApiProperty({ example: 'João Silva' })
    @IsString()
    @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
    name: string;

    @ApiProperty({ example: 'escritorio-silva' })
    @IsString()
    @Matches(/^[a-z0-9-]+$/, {
        message: 'Slug deve conter apenas letras minúsculas, números e hífens',
    })
    tenantSlug: string;
}
