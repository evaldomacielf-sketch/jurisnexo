using System.ComponentModel.DataAnnotations;

namespace JurisNexo.Application.DTOs.Auth;

/// <summary>
/// Requisição de login
/// </summary>
public record LoginRequest
{
    /// <summary>
    /// E-mail do usuário
    /// </summary>
    /// <example>joao@exemplo.com</example>
    [Required(ErrorMessage = "E-mail é obrigatório")]
    [EmailAddress(ErrorMessage = "E-mail inválido")]
    public string Email { get; init; } = string.Empty;

    /// <summary>
    /// Senha do usuário
    /// </summary>
    /// <example>SenhaSegura123!</example>
    [Required(ErrorMessage = "Senha é obrigatória")]
    [MinLength(8, ErrorMessage = "Senha deve ter no mínimo 8 caracteres")]
    public string Password { get; init; } = string.Empty;
}

/// <summary>
/// Resposta de login com tokens e dados do usuário
/// </summary>
public record LoginResponse
{
    /// <summary>
    /// Token JWT para autenticação
    /// </summary>
    /// <example>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</example>
    public string Token { get; init; } = string.Empty;

    /// <summary>
    /// Refresh token para renovação
    /// </summary>
    /// <example>a8d7f6e5c4b3a2d1e0f9...</example>
    public string RefreshToken { get; init; } = string.Empty;

    /// <summary>
    /// Dados do usuário autenticado
    /// </summary>
    public UserDto User { get; init; } = null!;

    /// <summary>
    /// Tempo de expiração do token em segundos
    /// </summary>
    /// <example>3600</example>
    public int ExpiresIn { get; init; }

    public LoginResponse(string token, string refreshToken, UserDto user, int expiresIn)
    {
        Token = token;
        RefreshToken = refreshToken;
        User = user;
        ExpiresIn = expiresIn;
    }
}

/// <summary>
/// Requisição de registro de novo usuário
/// </summary>
public record RegisterRequest
{
    /// <summary>
    /// E-mail do usuário
    /// </summary>
    /// <example>maria@exemplo.com</example>
    [Required(ErrorMessage = "E-mail é obrigatório")]
    [EmailAddress(ErrorMessage = "E-mail inválido")]
    public string Email { get; init; } = string.Empty;

    /// <summary>
    /// Senha (mínimo 8 caracteres, deve conter maiúsculas, minúsculas e números)
    /// </summary>
    /// <example>SenhaSegura123!</example>
    [Required(ErrorMessage = "Senha é obrigatória")]
    [MinLength(8, ErrorMessage = "Senha deve ter no mínimo 8 caracteres")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", 
        ErrorMessage = "Senha deve conter letras maiúsculas, minúsculas e números")]
    public string Password { get; init; } = string.Empty;

    /// <summary>
    /// Nome completo do usuário
    /// </summary>
    /// <example>Maria Silva</example>
    [Required(ErrorMessage = "Nome é obrigatório")]
    [MinLength(3, ErrorMessage = "Nome deve ter no mínimo 3 caracteres")]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Nome do escritório de advocacia
    /// </summary>
    /// <example>Silva Advocacia</example>
    [Required(ErrorMessage = "Nome do escritório é obrigatório")]
    public string FirmName { get; init; } = string.Empty;

    /// <summary>
    /// Telefone/WhatsApp (opcional)
    /// </summary>
    /// <example>11999999999</example>
    [Phone(ErrorMessage = "Telefone inválido")]
    public string? Phone { get; init; }
}

public record VerifyEmailRequest(string Email, string Code);
public record ResendVerificationRequest(string Email); 
public record ResetPasswordRequest(string Token, string Password, string PasswordConfirmation);
public record RefreshTokenRequest(string RefreshToken);
public record ForgotPasswordRequest(string Email);
