using JurisNexo.Application.DTOs.Auth;

namespace JurisNexo.Application.Services;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<LoginResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<bool> VerifyEmailAsync(VerifyEmailRequest request, CancellationToken cancellationToken = default);
    Task<bool> ResendVerificationCodeAsync(string email, CancellationToken cancellationToken = default);
    Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default);
    Task<bool> RequestPasswordResetAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default);
}
