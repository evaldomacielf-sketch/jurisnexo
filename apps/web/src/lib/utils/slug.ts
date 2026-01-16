/**
 * 🏢 Gera slug para tenant a partir do nome
 *
 * Regras:
 * - Lowercase
 * - Remove acentos
 * - Substitui espaços por hífens
 * - Remove caracteres especiais
 * - Formato: [a-z0-9-]
 *
 * @example
 * generateSlug("Advocacia Silva & Souza") => "advocacia-silva-souza"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais (exceto hífens e espaços)
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, ''); // Remove hífens no início/fim
}

/**
 * ✅ Valida formato de slug
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
