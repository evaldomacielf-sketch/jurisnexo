namespace JurisNexo.Application.DTOs;

public record UserDto(
    Guid Id,
    Guid TenantId,
    string Email,
    string Name,
    string Role,
    string? AvatarUrl,
    string? Phone,
    bool IsEmailVerified,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
