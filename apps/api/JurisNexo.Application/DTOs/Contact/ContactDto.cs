namespace JurisNexo.Application.DTOs.Contact;

public record ContactDto(
    Guid Id,
    Guid TenantId,
    string Name,
    string Phone,
    string? Email,
    string? Cpf,
    string? Address,
    string? City,
    string? State,
    string? ZipCode,
    string Source,
    List<string> Tags,
    string? Notes,
    bool IsLead,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
