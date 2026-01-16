import { z } from 'zod';

/**
 * Common validation schemas
 */

export const uuidSchema = z.string().uuid('ID inválido');

export const emailSchema = z.string().email('Email inválido');

export const phoneSchema = z.string().regex(
    /^\+?[1-9]\d{10,14}$/,
    'Telefone inválido. Use formato internacional: +5527999999999'
);

export const cpfSchema = z.string().regex(
    /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,
    'CPF inválido. Use formato: 000.000.000-00'
);

export const cnpjSchema = z.string().regex(
    /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/,
    'CNPJ inválido. Use formato: 00.000.000/0000-00'
);

export const oabSchema = z.string().regex(
    /^[A-Z]{2}\d{4,6}$/,
    'OAB inválida. Use formato: UF + número (ex: SP123456)'
);

export const slugSchema = z.string().regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug deve conter apenas letras minúsculas, números e hífens'
);

export const dateSchema = z.string().datetime();

export const monetarySchema = z.number().positive('Valor deve ser positivo');

/**
 * Validate CPF checksum
 */
export function isValidCpf(cpf: string): boolean {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleaned)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleaned[i]!) * (10 - i);
    }
    let digit = (sum * 10) % 11;
    if (digit === 10) digit = 0;
    if (digit !== parseInt(cleaned[9]!)) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleaned[i]!) * (11 - i);
    }
    digit = (sum * 10) % 11;
    if (digit === 10) digit = 0;
    return digit === parseInt(cleaned[10]!);
}

/**
 * Validate CNPJ checksum
 */
export function isValidCnpj(cnpj: string): boolean {
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return false;
    if (/^(\d)\1+$/.test(cleaned)) return false;

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(cleaned[i]!) * weights1[i]!;
    }
    let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit !== parseInt(cleaned[12]!)) return false;

    sum = 0;
    for (let i = 0; i < 13; i++) {
        sum += parseInt(cleaned[i]!) * weights2[i]!;
    }
    digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return digit === parseInt(cleaned[13]!);
}
