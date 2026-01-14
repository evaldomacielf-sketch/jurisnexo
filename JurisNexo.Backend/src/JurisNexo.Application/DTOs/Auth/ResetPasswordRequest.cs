namespace JurisNexo.Application.DTOs.Auth;

public record ResetPasswordRequest(
    string Token,
    string Password,
    string PasswordConfirmation
);
