using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using JurisNexo.Application.Services;
using JurisNexo.Application.DTOs.Auth;
using JurisNexo.Application.DTOs;

using Microsoft.AspNetCore.RateLimiting;

namespace JurisNexo.API.Controllers;

/// <summary>
/// Endpoints de autenticação e gerenciamento de usuários
/// </summary>
[ApiController]
[Route("api/auth")]
[Produces("application/json")]
[EnableRateLimiting("auth")]
public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Realiza login de usuário
    /// </summary>
    /// <param name="request">Credenciais de login (email e senha)</param>
    /// <param name="cancellationToken">Token de cancelamento</param>
    /// <returns>Token JWT, refresh token e dados do usuário</returns>
    /// <response code="200">Login realizado com sucesso</response>
    /// <response code="401">Credenciais inválidas ou e-mail não verificado</response>
    /// <response code="400">Requisição inválida</response>
    /// <remarks>
    /// Exemplo de requisição:
    /// 
    ///     POST /api/auth/login
    ///     {
    ///         "email": "joao@exemplo.com",
    ///         "password": "SenhaSegura123!"
    ///     }
    /// 
    /// O token JWT retornado deve ser incluído no header Authorization de todas as requisições subsequentes:
    /// 
    ///     Authorization: Bearer {token}
    ///     
    /// O token expira em 1 hora. Use o refresh token para renovar.
    /// </remarks>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request, 
        CancellationToken cancellationToken)
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

    /// <summary>
    /// Registra novo usuário e escritório (tenant)
    /// </summary>
    /// <param name="request">Dados de registro</param>
    /// <param name="cancellationToken">Token de cancelamento</param>
    /// <returns>Token JWT, refresh token e dados do usuário criado</returns>
    /// <response code="201">Usuário criado com sucesso</response>
    /// <response code="400">E-mail já cadastrado ou dados inválidos</response>
    /// <remarks>
    /// Exemplo de requisição:
    /// 
    ///     POST /api/auth/register
    ///     {
    ///         "email": "maria@exemplo.com",
    ///         "password": "SenhaSegura123!",
    ///         "name": "Maria Silva",
    ///         "firmName": "Silva Advocacia",
    ///         "phone": "11999999999"
    ///     }
    /// 
    /// Após o registro:
    /// - Um código de verificação de 6 dígitos será enviado para o e-mail
    /// - O usuário deve verificar o e-mail usando o endpoint /api/auth/verify-email
    /// - O tenant criado terá 30 dias de trial
    /// - O usuário criado terá role "Admin"
    /// </remarks>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request, 
        CancellationToken cancellationToken)
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

    /// <summary>
    /// Verifica e-mail com código de 6 dígitos
    /// </summary>
    /// <param name="request">E-mail e código de verificação</param>
    /// <param name="cancellationToken">Token de cancelamento</param>
    /// <returns>Confirmação de sucesso</returns>
    /// <response code="200">E-mail verificado com sucesso</response>
    /// <response code="400">Código inválido ou expirado</response>
    /// <response code="404">Usuário não encontrado</response>
    /// <remarks>
    /// O código de verificação é válido por 24 horas.
    /// Use o endpoint /api/auth/resend-verification para reenviar o código caso necessário.
    /// </remarks>
    [HttpPost("verify-email")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(SuccessResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VerifyEmail(
        [FromBody] VerifyEmailRequest request, 
        CancellationToken cancellationToken)
    {
        try
        {
            await _authService.VerifyEmailAsync(request, cancellationToken);
            return Ok(new SuccessResponse(true, "E-mail verificado com sucesso"));
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    /// <summary>
    /// Reenvia código de verificação de e-mail
    /// </summary>
    /// <param name="request">E-mail do usuário</param>
    /// <param name="cancellationToken">Token de cancelamento</param>
    /// <returns>Confirmação de envio</returns>
    /// <response code="200">Código reenviado com sucesso</response>
    /// <response code="404">Usuário não encontrado</response>
    [HttpPost("resend-verification")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(SuccessResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResendVerification(
        [FromBody] ResendVerificationRequest request, 
        CancellationToken cancellationToken)
    {
        try
        {
            await _authService.ResendVerificationCodeAsync(request.Email, cancellationToken);
            return Ok(new SuccessResponse(true, "Código reenviado com sucesso"));
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    /// <summary>
    /// Renova token JWT usando refresh token
    /// </summary>
    /// <param name="request">Refresh token</param>
    /// <param name="cancellationToken">Token de cancelamento</param>
    /// <returns>Novo token JWT e novo refresh token</returns>
    /// <response code="200">Token renovado com sucesso</response>
    /// <response code="401">Refresh token inválido ou expirado</response>
    /// <remarks>
    /// O refresh token é válido por 7 dias.
    /// Ao renovar, um novo refresh token é gerado e o anterior é invalidado.
    /// </remarks>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken(
        [FromBody] RefreshTokenRequest request, 
        CancellationToken cancellationToken)
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

    /// <summary>
    /// Solicita redefinição de senha
    /// </summary>
    /// <param name="request">E-mail do usuário</param>
    /// <param name="cancellationToken">Token de cancelamento</param>
    /// <returns>Confirmação de envio</returns>
    /// <response code="200">E-mail de redefinição enviado (sempre retorna sucesso por segurança)</response>
    /// <remarks>
    /// Um link com token será enviado para o e-mail cadastrado.
    /// O token é válido por 2 horas.
    /// Por segurança, sempre retorna sucesso mesmo se o e-mail não existir.
    /// </remarks>
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(SuccessResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordRequest request, 
        CancellationToken cancellationToken)
    {
        try
        {
            await _authService.RequestPasswordResetAsync(request.Email, cancellationToken);
            return Ok(new SuccessResponse(true, "Se o e-mail estiver cadastrado, você receberá instruções"));
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    /// <summary>
    /// Redefine senha usando token
    /// </summary>
    /// <param name="request">Token e nova senha</param>
    /// <param name="cancellationToken">Token de cancelamento</param>
    /// <returns>Confirmação de sucesso</returns>
    /// <response code="200">Senha redefinida com sucesso</response>
    /// <response code="400">Token inválido/expirado ou senhas não conferem</response>
    [HttpPost("reset-password")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(SuccessResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest request, 
        CancellationToken cancellationToken)
    {
        try
        {
            await _authService.ResetPasswordAsync(request, cancellationToken);
            return Ok(new SuccessResponse(true, "Senha redefinida com sucesso"));
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    /// <summary>
    /// Obtém perfil do usuário autenticado
    /// </summary>
    /// <param name="cancellationToken">Token de cancelamento</param>
    /// <returns>Dados do usuário</returns>
    /// <response code="200">Perfil retornado com sucesso</response>
    /// <response code="401">Token JWT inválido ou ausente</response>
    [Authorize]
    [HttpGet("profile")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var user = await _authService.GetUserProfileAsync(userId, cancellationToken);
            return Ok(user);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    /// <summary>
    /// Realiza logout (invalida refresh token)
    /// </summary>
    /// <param name="cancellationToken">Token de cancelamento</param>
    /// <returns>Sem conteúdo</returns>
    /// <response code="204">Logout realizado com sucesso</response>
    /// <response code="401">Token JWT inválido ou ausente</response>
    [Authorize]
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            // TODO: Invalidar refresh token do usuário
            return NoContent();
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }

    /// <summary>
    /// Cria tenant e usuário de teste (apenas desenvolvimento)
    /// </summary>
    /// <returns>Credenciais do usuário de teste</returns>
    /// <response code="200">Dados de teste criados com sucesso</response>
    [HttpPost("seed")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Seed(CancellationToken cancellationToken)
    {
        try
        {
            // Cria tenant de teste e usuário admin
            var seedResult = await _authService.SeedTestDataAsync(cancellationToken);
            return Ok(seedResult);
        }
        catch (Exception ex)
        {
            return HandleException(ex);
        }
    }
}

