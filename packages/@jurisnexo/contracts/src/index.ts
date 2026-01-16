/**
 * @jurisnexo/contracts
 *
 * Tipos TypeScript sincronizados com o backend .NET
 * Para atualizar: pnpm generate:types
 */

export * from './generated';

// Re-exports principais
export type {
  CaseDto,
  ClientDto,
  CreateCaseDto,
  UpdateCaseDto,
  UserDto,
  TenantDto,
  components,
  paths,
  operations,
} from './generated';
