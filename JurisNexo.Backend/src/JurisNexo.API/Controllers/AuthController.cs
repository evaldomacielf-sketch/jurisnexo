using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using JurisNexo.Application.Services;
using JurisNexo.Application.DTOs.Auth;
using JurisNexo.Application.DTOs;

namespace JurisNexo.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _authService.LoginAsync(request, cancellationToken);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _authService.RegisterAsync(request, cancellationToken);
            return Created("", response);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [HttpPost("verify-email")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request, CancellationToken cancellationToken)
    {
        try
        {
            await _authService.VerifyEmailAsync(request, cancellationToken);
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [HttpPost("resend-verification")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationRequest request, CancellationToken cancellationToken)
    {
        try
        {
            await _authService.ResendVerificationCodeAsync(request.Email, cancellationToken);
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [HttpPost("refresh")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _authService.RefreshTokenAsync(request, cancellationToken);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [HttpPost("forgot-password")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        try
        {
            await _authService.RequestPasswordResetAsync(request.Email, cancellationToken);
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [HttpPost("reset-password")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        try
        {
            await _authService.ResetPasswordAsync(request, cancellationToken);
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [Authorize]
    [HttpGet("profile")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            // Implementar busca de perfil
            // TODO: Injetar IUserService ou usar Mediator para buscar perfil
            return Ok(); 
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    [Authorize]
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        // Invalidar refresh token
        return NoContent();
    }
}
