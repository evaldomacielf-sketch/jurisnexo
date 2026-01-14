namespace JurisNexo.Application.DTOs.Auth;

public record RegisterRequest(
    string Email,
    string Password,
    string Name,
    string FirmName,
    string? Phone
);
