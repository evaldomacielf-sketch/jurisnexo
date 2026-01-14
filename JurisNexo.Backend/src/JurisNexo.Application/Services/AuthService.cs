using JurisNexo.Application.DTOs;
using JurisNexo.Application.DTOs.Auth;
using JurisNexo.Domain.Entities;
using JurisNexo.Domain.Interfaces;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.Common.Exceptions;

namespace JurisNexo.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRepository<Tenant> _tenantRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPipelineSeeder _pipelineSeeder;

    public AuthService(
        IUserRepository userRepository,
        IRepository<Tenant> tenantRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IEmailService emailService,
        IUnitOfWork unitOfWork,
        IPipelineSeeder pipelineSeeder)
    {
        _userRepository = userRepository;
        _tenantRepository = tenantRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
        _pipelineSeeder = pipelineSeeder;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken)
            ?? throw new UnauthorizedException("Credenciais inválidas");

        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
            throw new UnauthorizedException("Credenciais inválidas");

        if (!user.IsEmailVerified)
            throw new UnauthorizedException("E-mail não verificado");

        var token = _jwtTokenGenerator.GenerateToken(user);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7);
        await _userRepository.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new LoginResponse(
            token,
            refreshToken,
            MapToUserDto(user),
            3600
        );
    }

    public async Task<LoginResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        if (await _userRepository.EmailExistsAsync(request.Email, cancellationToken))
            throw new BadRequestException("E-mail já cadastrado");

        // Cria tenant
        var tenant = new Tenant
        {
            FirmName = request.FirmName,
            Email = request.Email,
            Phone = request.Phone,
            IsActive = true,
            TrialEndsAt = DateTime.UtcNow.AddDays(30)
        };

        await _tenantRepository.AddAsync(tenant, cancellationToken);

        // Cria usuário admin
        var verificationCode = GenerateVerificationCode();
        var user = new User
        {
            TenantId = tenant.Id,
            Name = request.Name,
            Email = request.Email,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            Phone = request.Phone,
            Role = UserRole.Admin,
            IsEmailVerified = false,
            EmailVerificationCode = verificationCode,
            EmailVerificationCodeExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Envia e-mail de verificação
        await _emailService.SendVerificationEmailAsync(user.Email, user.Name, verificationCode);

        // Seed default pipeline
        await _pipelineSeeder.SeedDefaultPipelineAsync(tenant.Id);

        var token = _jwtTokenGenerator.GenerateToken(user);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        return new LoginResponse(
            token,
            refreshToken,
            MapToUserDto(user),
            3600
        );
    }

    public async Task<bool> VerifyEmailAsync(VerifyEmailRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken)
            ?? throw new NotFoundException("Usuário não encontrado");

        if (user.IsEmailVerified)
            return true;

        if (user.EmailVerificationCode != request.Code)
            throw new BadRequestException("Código inválido");

        if (user.EmailVerificationCodeExpiresAt < DateTime.UtcNow)
            throw new BadRequestException("Código expirado");

        user.IsEmailVerified = true;
        user.EmailVerificationCode = null;
        user.EmailVerificationCodeExpiresAt = null;

        await _userRepository.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<bool> ResendVerificationCodeAsync(string email, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken)
            ?? throw new NotFoundException("Usuário não encontrado");

        if (user.IsEmailVerified)
            return true;

        var verificationCode = GenerateVerificationCode();
        user.EmailVerificationCode = verificationCode;
        user.EmailVerificationCodeExpiresAt = DateTime.UtcNow.AddHours(24);

        await _userRepository.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _emailService.SendVerificationEmailAsync(user.Email, user.Name, verificationCode);

        return true;
    }

    public async Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByRefreshTokenAsync(request.RefreshToken, cancellationToken)
            ?? throw new UnauthorizedException("Token inválido");

        if (user.RefreshTokenExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedException("Token expirado");

        var token = _jwtTokenGenerator.GenerateToken(user);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7);

        await _userRepository.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new LoginResponse(
            token,
            refreshToken,
            MapToUserDto(user),
            3600
        );
    }

    public async Task<bool> RequestPasswordResetAsync(string email, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (user == null)
            return true; // Não revela se o e-mail existe

        var resetToken = Guid.NewGuid().ToString("N");
        user.PasswordResetToken = resetToken;
        user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddHours(2);

        await _userRepository.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _emailService.SendPasswordResetEmailAsync(user.Email, user.Name, resetToken);

        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetAllAsync(cancellationToken)
            .ContinueWith(t => t.Result.FirstOrDefault(u => u.PasswordResetToken == request.Token), cancellationToken)
            ?? throw new BadRequestException("Token inválido");

        if (user.PasswordResetTokenExpiresAt < DateTime.UtcNow)
            throw new BadRequestException("Token expirado");

        if (request.Password != request.PasswordConfirmation)
            throw new BadRequestException("Senhas não conferem");

        user.PasswordHash = _passwordHasher.HashPassword(request.Password);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiresAt = null;

        await _userRepository.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static string GenerateVerificationCode()
    {
        return Random.Shared.Next(100000, 999999).ToString();
    }

    private static UserDto MapToUserDto(User user)
    {
        return new UserDto(
            user.Id,
            user.TenantId,
            user.Email,
            user.Name,
            user.Role.ToString(),
            user.AvatarUrl,
            user.Phone,
            user.IsEmailVerified,
            user.CreatedAt,
            user.UpdatedAt
        );
    }
}
