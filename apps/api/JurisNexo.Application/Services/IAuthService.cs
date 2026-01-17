using JurisNexo.Application.DTOs.Auth;
using JurisNexo.Application.DTOs;

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
    Task<UserDto> GetUserProfileAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<object> SeedTestDataAsync(CancellationToken cancellationToken = default);
}

