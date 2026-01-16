using JurisNexo.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace JurisNexo.Infrastructure.Services;

public class DevEmailService : IEmailService
{
    private readonly ILogger<DevEmailService> _logger;

    public DevEmailService(ILogger<DevEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendVerificationEmailAsync(string email, string name, string code)
    {
        _logger.LogInformation("--------------------------------------------------");
        _logger.LogInformation($"[DEV EMAIL] To: {email} ({name})");
        _logger.LogInformation($"[DEV EMAIL] Subject: Verify Email");
        _logger.LogInformation($"[DEV EMAIL] Verification Code: {code}");
        _logger.LogInformation("--------------------------------------------------");
        return Task.CompletedTask;
    }

    public Task SendPasswordResetEmailAsync(string email, string name, string token)
    {
        _logger.LogInformation("--------------------------------------------------");
        _logger.LogInformation($"[DEV EMAIL] To: {email} ({name})");
        _logger.LogInformation($"[DEV EMAIL] Subject: Reset Password");
        _logger.LogInformation($"[DEV EMAIL] Token: {token}");
        _logger.LogInformation("--------------------------------------------------");
        return Task.CompletedTask;
    }

    public Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        _logger.LogInformation("--------------------------------------------------");
        _logger.LogInformation($"[DEV EMAIL] To: {to}");
        _logger.LogInformation($"[DEV EMAIL] Subject: {subject}");
        _logger.LogInformation($"[DEV EMAIL] Body: {htmlBody}");
        _logger.LogInformation("--------------------------------------------------");
        return Task.CompletedTask;
    }
}
