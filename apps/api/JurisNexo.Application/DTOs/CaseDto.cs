// Re-exporta DTOs para facilitar imports
global using CaseDto = JurisNexo.Application.DTOs.CaseDtoSimple;

namespace JurisNexo.Application.DTOs;

/// <summary>
/// DTO simplificado para uso nos Controllers
/// </summary>
public record CaseDtoSimple(
    Guid Id,
    string Title,
    string Number,
    string? Description,
    string Status,
    Guid ClientId,
    string? ClientName,
    Guid? ResponsibleUserId,
    string? ResponsibleUserName,
    string? Court,
    DateTime? DistributionDate,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
