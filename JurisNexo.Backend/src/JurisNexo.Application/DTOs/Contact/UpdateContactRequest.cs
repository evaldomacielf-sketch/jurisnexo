namespace JurisNexo.Application.DTOs.Contact;

public record UpdateContactRequest(
    string? Name,
    string? Phone,
    string? Email,
    string? Cpf,
    string? Address,
    string? City,
    string? State,
    string? ZipCode,
    string? Source,
    List<string>? Tags,
    string? Notes,
    bool? IsLead
);
