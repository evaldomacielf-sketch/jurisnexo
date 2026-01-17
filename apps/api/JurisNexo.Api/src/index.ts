/**
 * Tipos TypeScript gerados automaticamente do backend .NET
 * ⚠️ NÃO EDITE ESTE ARQUIVO MANUALMENTE
 * Para atualizar: pnpm generate:types
 */

export * from './generated'

// Re-exports convenientes
export type { 
  components,
  paths,
  operations 
} from './generated'

// Tipos de DTOs mais usados
export type CaseDto = components['schemas']['CaseDto']
export type ClientDto = components['schemas']['ClientDto']
export type CreateCaseDto = components['schemas']['CreateCaseDto']
export type UpdateCaseDto = components['schemas']['UpdateCaseDto']
