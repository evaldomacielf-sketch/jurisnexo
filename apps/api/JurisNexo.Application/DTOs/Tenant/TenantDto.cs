namespace JurisNexo.Application.DTOs.Tenant;

public record TenantDto(
    Guid Id,
    string Slug,
    string Name,
    string? Plan,
    string? Status,
    DateTime? TrialEndsAt,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
