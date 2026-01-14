namespace JurisNexo.Application.DTOs.Auth;

public record VerifyEmailRequest(
    string Email,
    string Code
);
